import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import path from 'path'

const GREEN = '#1a6b3c'
const GREEN_LIGHT = '#f0faf4'
const BORDER = '#d1e7dd'
const TEXT_DARK = '#111827'
const TEXT_MID = '#4b5563'
const TEXT_LIGHT = '#9ca3af'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
    paddingVertical: 36,
    fontSize: 10,
    color: TEXT_DARK,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
  },
  logo: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  headerText: { flex: 1 },
  orgName: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: GREEN },
  orgSub: { fontSize: 9, color: TEXT_MID, marginTop: 2, letterSpacing: 1 },
  tagline: { fontSize: 8, color: TEXT_LIGHT, marginTop: 3, fontStyle: 'italic' },
  receiptBadge: {
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#fff', textAlign: 'center' },
  badgeSub: { fontSize: 8, color: '#bbf7d0', textAlign: 'center', marginTop: 2 },

  // Info bar
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: GREEN_LIGHT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  infoItem: { flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 8, color: TEXT_LIGHT, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: TEXT_DARK },
  infoValueGreen: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: GREEN },

  // Section
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_MID,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 4,
  },

  // Student info grid
  grid: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  gridCol: { flex: 1 },
  fieldRow: { flexDirection: 'row', marginBottom: 6 },
  fieldLabel: { fontSize: 9, color: TEXT_LIGHT, width: 76 },
  fieldColon: { fontSize: 9, color: TEXT_LIGHT, marginRight: 4 },
  fieldValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT_DARK, flex: 1 },

  // Table
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tableHeaderDesc: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#fff' },
  tableHeaderAmt: { width: 80, fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#fff', textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableDesc: { flex: 1, fontSize: 9, color: TEXT_MID },
  tableAmt: { width: 80, fontSize: 9, color: TEXT_DARK, textAlign: 'right' },
  tableTotalRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: GREEN_LIGHT,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableTotalLabel: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 10, color: GREEN },
  tableTotalAmt: { width: 80, fontFamily: 'Helvetica-Bold', fontSize: 12, color: GREEN, textAlign: 'right' },

  // Payment details row
  payRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  payCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  payCellLast: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  payCellLabel: { fontSize: 8, color: TEXT_LIGHT, textAlign: 'center', marginBottom: 3 },
  payCellValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TEXT_DARK, textAlign: 'center' },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerLeft: { fontSize: 8, color: TEXT_LIGHT, maxWidth: 180 },
  footerSign: { alignItems: 'center' },
  signLine: { width: 110, borderTopWidth: 1, borderTopColor: TEXT_DARK, marginBottom: 4 },
  signLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: TEXT_DARK },
  signSub: { fontSize: 8, color: TEXT_LIGHT },

  // Verified stamp
  stamp: {
    borderWidth: 2,
    borderColor: GREEN,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  stampText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: GREEN },
  stampSub: { fontSize: 7, color: GREEN, marginTop: 1 },
})

interface ReceiptProps {
  receiptNumber: string
  date: string
  studentName: string
  federationId: string
  amount: number
  paymentType: string
  periodCovered: string
  lineItems?: { description: string; amount: number }[]
  mobileNumber?: string
  email?: string
  batch?: string
  studentClass?: string
  pendingDues?: number
  advanceBalance?: number
}

export const ReceiptPDF = ({
  receiptNumber,
  date,
  studentName,
  federationId,
  amount,
  paymentType,
  periodCovered,
  lineItems,
  mobileNumber,
  email,
  batch,
  studentClass,
  pendingDues = 0,
  advanceBalance = 0,
}: ReceiptProps) => {
  const batchDisplay = [studentClass, batch].filter(Boolean).join(' - ') || 'N/A'
  const items = lineItems && lineItems.length > 0
    ? lineItems
    : [{ description: `Federation Donation - ${periodCovered}`, amount }]

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Image
            src={path.join(process.cwd(), 'public', 'logo.png')}
            style={styles.logo}
          />
          <View style={styles.headerText}>
            <Text style={styles.orgName}>Vriksh Students Federation</Text>
            <Text style={styles.orgSub}>OFFICIAL DONATION RECEIPT</Text>
            <Text style={styles.tagline}>Together for Education, Together for a Better Tomorrow</Text>
          </View>
          <View style={styles.receiptBadge}>
            <Text style={styles.badgeTitle}>DONATION{'\n'}RECEIPT</Text>
            <Text style={styles.badgeSub}>Verified</Text>
          </View>
        </View>

        {/* INFO BAR */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Receipt No.</Text>
            <Text style={styles.infoValueGreen}>{receiptNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Period</Text>
            <Text style={styles.infoValue}>{periodCovered}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>{paymentType}</Text>
          </View>
        </View>

        {/* MEMBER DETAILS */}
        <Text style={styles.sectionTitle}>Member Details</Text>
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.fieldColon}>:</Text>
              <Text style={styles.fieldValue}>{studentName}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Federation ID</Text>
              <Text style={styles.fieldColon}>:</Text>
              <Text style={styles.fieldValue}>{federationId}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Batch / Class</Text>
              <Text style={styles.fieldColon}>:</Text>
              <Text style={styles.fieldValue}>{batchDisplay}</Text>
            </View>
          </View>
          <View style={styles.gridCol}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Mobile</Text>
              <Text style={styles.fieldColon}>:</Text>
              <Text style={styles.fieldValue}>{mobileNumber ? `+91 ${mobileNumber}` : 'N/A'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldColon}>:</Text>
              <Text style={styles.fieldValue}>{email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* DONATION TABLE */}
        <Text style={styles.sectionTitle}>Donation Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderDesc}>Description</Text>
            <Text style={styles.tableHeaderAmt}>Amount (Rs.)</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : GREEN_LIGHT }]}>
              <Text style={styles.tableDesc}>{item.description}</Text>
              <Text style={styles.tableAmt}>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableTotalRow}>
            <Text style={styles.tableTotalLabel}>Total Amount Received</Text>
            <Text style={styles.tableTotalAmt}>Rs. {amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* DUES STANDING */}
        <Text style={styles.sectionTitle}>Dues Standing (Post-Payment)</Text>
        <View style={styles.payRow}>
          <View style={styles.payCell}>
            <Text style={styles.payCellLabel}>Current Pending Dues</Text>
            <Text style={styles.payCellValue}>Rs. {pendingDues.toFixed(2)}</Text>
          </View>
          <View style={styles.payCellLast}>
            <Text style={styles.payCellLabel}>Current Advance Balance</Text>
            <Text style={styles.payCellValue}>Rs. {advanceBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLeft}>
              This is a computer-generated receipt and is valid without a physical signature.
              For queries contact: vrikshsf@gmail.com
            </Text>
          </View>
          <View style={styles.footerSign}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Authorized Signatory</Text>
            <Text style={styles.signSub}>Vriksh Students Federation</Text>
          </View>
          <View style={styles.stamp}>
            <Text style={styles.stampText}>PAID</Text>
            <Text style={styles.stampSub}>VERIFIED</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
