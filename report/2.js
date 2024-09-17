// 2.js

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

function generateWordDocument(report) {
  // Now access the docx library after it's been loaded correctly
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } = docx;

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


