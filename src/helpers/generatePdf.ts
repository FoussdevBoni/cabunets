import jsPDF from 'jspdf';
import autoTable, { jsPDFDocument } from 'jspdf-autotable';
import { Entreprise } from '../types/features/Entreprise';
import { Facture } from '../types/features/Facture';

export const generateFacturePDF = (
  facture: Facture,
  entreprise: Entreprise
): jsPDFDocument => {

  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  /* ==========================
      FORMATAGE
  ========================== */

  const formatPrix = (prix: number): string =>
    prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const formatPrixAvecDevise = (prix: number): string =>
    `${formatPrix(prix)} FCFA`;

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const getStatutLabel = (statut: string): string => ({
    brouillon: 'Brouillon',
    validée: 'Validée',
    payée: 'Payée',
    partiellement_payée: 'Partiellement payée',
    annulée: 'Annulée'
  }[statut] || statut);

  /* ==========================
      EN-TÊTE ENTREPRISE
  ========================== */

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(entreprise.nom || '', margin, margin + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let entrepriseY = margin + 16;

  if (entreprise.adresse) {
    doc.text(entreprise.adresse, margin, entrepriseY);
    entrepriseY += 5;
  }
  if (entreprise.email) {
    doc.text(entreprise.email, margin, entrepriseY);
    entrepriseY += 5;
  }
  if (entreprise.phone) {
    doc.text(entreprise.phone, margin, entrepriseY);
  }

  /* ==========================
      TITRE FACTURE
  ========================== */

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FACTURE', pageWidth - margin, margin + 10, { align: 'right' });

  doc.setFontSize(10);
  doc.text(`N° ${facture.numero}`, pageWidth - margin, margin + 17, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date : ${formatDate(facture.dateCreation)}`, pageWidth - margin, margin + 23, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text(`Statut : ${getStatutLabel(facture.statut)}`, pageWidth - margin, margin + 29, { align: 'right' });

  /* ==========================
      CLIENT
  ========================== */

  let y = margin + 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Client :', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let clientY = y + 6;
  doc.text(facture.client.nom, margin, clientY);
  clientY += 5;

  if (facture.client.email) {
    doc.text(facture.client.email, margin, clientY);
    clientY += 5;
  }
  if (facture.client.telephone) {
    doc.text(facture.client.telephone, margin, clientY);
    clientY += 5;
  }
  if (facture.client.adresse) {
    doc.text(facture.client.adresse, margin, clientY);
  }

  y = clientY + 15;

  /* ==========================
      TABLE FACTURE (SAFE)
  ========================== */

  const headers = [['Description', 'Qté', 'Prix unitaire', 'TVA', 'Montant HT']];

  const body = facture.lignes.map(ligne => [
    ligne.description,
    String(ligne.quantite),
    formatPrixAvecDevise(ligne.prixUnitaireHT),
    `${ligne.tva}%`,
    formatPrixAvecDevise(ligne.totalHT)
  ]);

  try {
    autoTable(doc, {
      startY: y,
      head: headers,
      body,
      theme: 'grid',
      tableWidth: 'auto',

      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },

      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },

      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },  // description
        1: { cellWidth: 15, halign: 'center' },    // quantité
        2: { cellWidth: 30, halign: 'right' },     // prix
        3: { cellWidth: 15, halign: 'center' },    // TVA
        4: { cellWidth: 30, halign: 'right' }      // total
      },

      margin: { left: margin, right: margin }
    });
  } catch (e) {
    console.error('Erreur autoTable', e);
    throw e;
  }

  /* ==========================
      TOTAUX
  ========================== */

  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 80;
  let currentY = finalY + 15;
  const totalsX = pageWidth - margin;

  const remiseMontant = facture.sousTotalHT * (facture.remise / 100);
  const sousTotalApresRemise = facture.sousTotalHT - remiseMontant;

  const addLine = (label: string, value: number, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 9);

    doc.text(label, totalsX - 100, currentY);
    doc.text(formatPrixAvecDevise(value), totalsX, currentY, { align: 'right' });
    currentY += 6;
  };

  addLine('Sous-total HT :', facture.sousTotalHT);

  if (facture.remise > 0) {
    addLine(`Remise (${facture.remise}%) :`, -remiseMontant);
    addLine('Sous-total après remise :', sousTotalApresRemise);
  }

  addLine('TVA :', facture.totalTVA);

  currentY += 3;
  doc.setLineWidth(0.3);
  doc.line(totalsX - 100, currentY, totalsX, currentY);
  currentY += 6;

  addLine('TOTAL TTC :', facture.totalTTC, true);

  /* ==========================
      PIED DE PAGE
  ========================== */

  doc.setFontSize(7);
  doc.setTextColor(128);

  doc.text(
    `Facture ${facture.numero} • Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};
