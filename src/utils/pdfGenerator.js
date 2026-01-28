/**
 * Generates a PDF from a DOM element using html2canvas + jsPDF.
 * This is client-side only; ensure the element is visible in the viewport.
 */
export async function generateSprintPDF({
  element,
  elementId,
  fileName = "sprint-report.pdf",
  meta = {},
  scale = 1.6,
  excludeSelectors = ["[data-export-ignore]"],
} = {}) {
  if (typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser.")
  }

  const targetElement = element || (elementId ? document.getElementById(elementId) : null)
  if (!targetElement) {
    throw new Error("Element not found for PDF export.")
  }

  const [{ jsPDF }, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas")])

  const canvas = await html2canvas.default(targetElement, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    ignoreElements: (el) => excludeSelectors.some((selector) => el.matches?.(selector) || el.closest?.(selector)),
  })
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth - 40
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Header
  pdf.setFontSize(14)
  pdf.text(meta?.module || "Sprint Report", 20, 24)
  pdf.setFontSize(10)
  pdf.text(`Squad: ${meta?.squad || "-"}`, 20, 40)
  pdf.text(`Sprint: ${meta?.sprint || "-"}`, 20, 52)
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 64)

  // Image
  pdf.addImage(imgData, "PNG", 20, 80, imgWidth, Math.min(imgHeight, pageHeight - 100))

  pdf.save(fileName)
}

export const __testables = { generateSprintPDF }
