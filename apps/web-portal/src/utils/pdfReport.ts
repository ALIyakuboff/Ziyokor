import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates a PDF report for workers' tasks
 */
export async function generateWorkerPDFReport(
    title: string,
    period: string,
    data: { worker_name: string; tasks: any[] }[]
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("ZIYOKOR - HISOBOT", 105, 20, { align: "center" });

    doc.setFontSize(16);
    doc.text(title, 105, 30, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Davr: ${period}`, 105, 38, { align: "center" });

    doc.line(20, 45, 190, 45);

    let startY = 55;

    // Table Data
    const tableRows: any[] = [];

    data.forEach(worker => {
        worker.tasks.forEach((task, idx) => {
            const statusLabel = task.status === "done" ? "BAJARILGAN" : "BAJARILMAGAN";
            const row = [
                idx === 0 ? worker.worker_name : "", // Show name only on first task for cleaner look
                task.visible_date,
                task.title,
                statusLabel
            ];
            tableRows.push(row);
        });

        // Add empty separator row between workers
        if (worker.tasks.length > 0) {
            tableRows.push(["", "", "", ""]);
        }
    });

    autoTable(doc, {
        head: [["Ishchi", "Sana", "Vazifa mazmuni", "Holat"]],
        body: tableRows,
        startY: startY,
        theme: "grid",
        headStyles: { fillColor: [65, 209, 122], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: "auto" },
            3: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
            // Footer
            const str = "Sahifa " + doc.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(str, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
        }
    });

    const fileName = `ziyokor_hisobot_${period.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}
