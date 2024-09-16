// script.js

// Import necessary classes from docx
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = docx;

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const csvFileInput = document.getElementById('csvFile');
  const generateReportButton = document.getElementById('generateReport');

  generateReportButton.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (!file) {
      alert('Please select a CSV file.');
      return;
    }

    // Parse the CSV file
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: function(results) {
        const data = results.data;
        try {
          const report = processData(data);
          generateWordDocument(report);
        } catch (error) {
          console.error(error);
          alert('An error occurred while generating the report.');
        }
      },
      error: function(err) {
        console.error(err);
        alert('Failed to parse CSV file.');
      }
    });
  });
});

/**
 * Processes the CSV data and organizes it into sections.
 * @param {Array<Array<string>>} data - The parsed CSV data.
 * @returns {Object} - An object containing organized sections.
 */
function processData(data) {
  const sectionHeaders = ['Sales Summary', 'Revenue Centers', 'Tenders', 'Taxes',
                         'Cash Skims', 'Discounts', 'Promotions', 'Destinations'];

  const includeSections = ['Sales Summary', 'Revenue Centers', 'Tenders', 'Taxes'];
  const excludeSections = ['Cash Skims', 'Discounts', 'Promotions', 'Destinations'];

  const sections = {};
  let currentSection = null;

  data.forEach(row => {
    // Remove empty strings and trim whitespace
    row = row.map(cell => cell.trim()).filter(cell => cell !== '');
    if (row.length === 0) return; // Skip empty rows

    const firstItem = row[0];
    if (sectionHeaders.includes(firstItem)) {
      if (includeSections.includes(firstItem)) {
        currentSection = firstItem;
        sections[currentSection] = [];
        sections[currentSection].push(row); // Include the section header row
      } else {
        currentSection = 'Skip'; // Skipping this section
      }
      return;
    } else if (firstItem.startsWith('Page ')) {
      return; // Skip page footer
    }

    if (currentSection && currentSection !== 'Skip') {
      sections[currentSection].push(row);
    } else {
      currentSection = null;
    }
  });

  // Ensure 'Sales Summary' exists
  if (!sections['Sales Summary'] || sections['Sales Summary'].length === 0) {
    throw new Error("Error: 'Sales Summary' section not found or is empty.");
  }

  // Extract date and location
  const salesSummarySection = sections['Sales Summary'];
  let locationText = '';
  if (salesSummarySection[0].length > 1) {
    locationText = salesSummarySection[0][1];
  }

  let dateText = '';
  if (salesSummarySection.length > 1 && salesSummarySection[1].length > 0) {
    dateText = salesSummarySection[1][0];
  }

  const dateLocation = `${dateText} ${locationText}`;

  // Remove the first two rows as they are used above
  const salesSummaryRows = salesSummarySection.slice(2);

  // Process Sales Summary
  const salesData = [];

  // Flatten the data
  const flattenedData = salesSummaryRows.flat().filter(cell => cell !== '');

  // Extract key-value pairs
  const keyValuePairs = [];
  let i = 0;
  while (i < flattenedData.length) {
    const key = flattenedData[i];
    let value = '';
    if (i + 1 < flattenedData.length) {
      const potentialValue = flattenedData[i + 1];
      if (sectionHeaders.includes(potentialValue) || /^[^\d\$\.\%]+$/.test(potentialValue)) {
        value = '';
        i += 1;
      } else {
        value = potentialValue.replace(/,/g, '');
        i += 2;
      }
    } else {
      i += 1;
    }
    keyValuePairs.push({ key, value });
  }

  // Remove duplicates while preserving order
  const seen = new Set();
  const keyValuePairsUnique = keyValuePairs.filter(pair => {
    if (seen.has(pair.key)) {
      return false;
    }
    seen.add(pair.key);
    return true;
  });

  // Organize into columns (4 columns)
  const salesOverview = [];
  const numColumns = 4;
  for (let j = 0; j < keyValuePairsUnique.length; j += numColumns) {
    const row = keyValuePairsUnique.slice(j, j + numColumns);
    salesOverview.push(row);
  }

  // Function to create section tables
  const createSectionTable = (sectionName) => {
    if (!(sectionName in sections)) return null;

    const sectionRows = sections[sectionName].filter(row => row.some(cell => cell.trim() !== ''));

    if (sectionRows.length < 2) return null; // Need at least header and one data row

    const headers = sectionRows[1]; // Assuming the second row contains headers
    const dataRows = sectionRows.slice(2).filter(row => !row.some(cell => /Total/i.test(cell)));

    // Process data rows
    const processedRows = dataRows.map(row => {
      return row.map(cell => {
        // Remove commas within numbers
        return cell.replace(/,/g, '');
      });
    });

    return {
      headers,
      data: processedRows
    };
  };

  // Process Taxes separately to include only GST Tax and PST Tax
  const processTaxesSection = () => {
    if (!('Taxes' in sections)) return null;

    const sectionRows = sections['Taxes'].filter(row => row.some(cell => cell.trim() !== ''));

    if (sectionRows.length < 2) return null;

    const headers = sectionRows[1];
    const dataRows = sectionRows.slice(2).filter(row => ['GST Tax', 'PST Tax'].includes(row[0]));

    const processedRows = dataRows.map(row => {
      return row.map(cell => cell.replace(/,/g, ''));
    });

    return {
      headers,
      data: processedRows
    };
  };

  // Compile all processed data into a report object
  const report = {
    dateLocation,
    salesOverview,
    sections: {
      'Revenue Centers': createSectionTable('Revenue Centers'),
      'Tenders': createSectionTable('Tenders'),
      'Taxes': processTaxesSection()
    }
  };

  return report;
}

/**
 * Generates the Word document using the processed report data.
 * @param {Object} report - The processed report data.
 */
async function generateWordDocument(report) {
  const doc = new Document({
    sections: [{
      properties: {
        margin: {
          top: convertInchesToTwip(0.5),
          bottom: convertInchesToTwip(0.5),
          left: convertInchesToTwip(0.5),
          right: convertInchesToTwip(0.5),
        }
      },
      children: []
    }]
  });

  const section = doc.sections[0].children;

  // Add date and location paragraph
  section.push(new Paragraph({
    text: report.dateLocation,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 120 // 6 points
    },
    style: "Normal"
  }));

  // Add Sales Overview Heading
  section.push(new Paragraph({
    text: "Sales Overview",
    heading: HeadingLevel.HEADING_2,
    spacing: {
      before: 240, // 12 points
      after: 120
    }
  }));

  // Create Sales Overview Table
  const salesTableRows = report.salesOverview.map(row => {
    return new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph({
          text: `${cell.key}: ${cell.value}`,
          spacing: {
            before: 20,
            after: 20
          },
          run: {
            size: 18 // 9pt
          }
        })],
        verticalAlign: docx.VerticalAlign.CENTER,
        width: {
          size: 25,
          type: WidthType.PERCENTAGE
        }
      }))
    });
  });

  const salesTable = new Table({
    rows: salesTableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    borders: {
      top: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
    }
  });

  section.push(salesTable);

  // Function to add sections
  const addSection = (sectionName, sectionData) => {
    if (!sectionData) return;

    section.push(new Paragraph({
      text: sectionName,
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 240,
        after: 120
      }
    }));

    // Create table headers
    const tableHeaders = sectionData.headers.map(header => new Paragraph({
      text: header,
      bold: true,
      size: 18 // 9pt
    }));

    const headerRow = new TableRow({
      children: sectionData.headers.map(header => new TableCell({
        children: [new Paragraph({
          text: header,
          bold: true,
          size: 18
        })],
        verticalAlign: docx.VerticalAlign.CENTER,
        width: {
          size: 100 / sectionData.headers.length,
          type: WidthType.PERCENTAGE
        }
      }))
    });

    // Create data rows
    const dataRows = sectionData.data.map(row => {
      return new TableRow({
        children: row.map(cell => new TableCell({
          children: [new Paragraph({
            text: cell,
            size: 18 // 9pt
          })],
          verticalAlign: docx.VerticalAlign.CENTER,
          width: {
            size: 100 / sectionData.headers.length,
            type: WidthType.PERCENTAGE
          }
        }))
      });
    });

    // Create the table
    const table = new Table({
      rows: [headerRow, ...dataRows],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: {
        top: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
        right: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
        insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
        insideVertical: { style: docx.BorderStyle.SINGLE, size: 1, color: "000000" },
      }
    });

    section.push(table);
  };

  // Add Revenue Centers and Tenders sections
  addSection('Revenue Centers', report.sections['Revenue Centers']);
  addSection('Tenders', report.sections['Tenders']);

  // Add Taxes section with only GST Tax and PST Tax
  addSection('Taxes', report.sections['Taxes']);

  // Generate the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Sales_Summary_Report.docx");
}

/**
 * Converts inches to twips (1 inch = 1440 twips)
 * @param {number} inches
 * @returns {number} twips
 */
function convertInchesToTwip(inches) {
  return inches * 1440;
}
