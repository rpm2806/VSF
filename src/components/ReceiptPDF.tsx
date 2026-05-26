import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, Line, Rect } from '@react-pdf/renderer'
import path from 'path'

const GREEN = '#1a6b3c'
const GREEN_LIGHT = '#e8f5ee'
const GREEN_MID = '#2d8653'
const GREEN_DARK = '#0f4023'
const BORDER_COLOR = '#c8e6c9'
const TEXT_DARK = '#1a1a1a'
const TEXT_MID = '#4a4a4a'
const TEXT_LIGHT = '#6b7280'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingHorizontal: 36,
    paddingVertical: 30,
    fontSize: 10,
    color: TEXT_DARK,
  },

  // ── HEADER ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoText: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GREEN, textAlign: 'center', marginTop: 2 },
  centerHeader: { flex: 1, alignItems: 'center' },
  orgName: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: GREEN, letterSpacing: 1 },
  orgSub: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: GREEN_MID, letterSpacing: 2 },
  dividerLeaf: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: GREEN },
  tagline: { fontSize: 9, color: TEXT_MID, fontStyle: 'italic', textAlign: 'center', marginTop: 4 },

  // Donation Receipt badge
  badgeBox: {
    backgroundColor: GREEN,
    width: 80,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  badgeTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },

  // ── RECEIPT INFO ROW ─────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  infoLeft: { flexDirection: 'column' },
  infoItem: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { fontSize: 10, color: TEXT_MID, width: 70 },
  infoColon: { fontSize: 10, color: TEXT_MID, width: 8 },
  infoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: TEXT_DARK },
  receiptNumValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: GREEN },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: GREEN,
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: GREEN, marginLeft: 4 },

  // ── SECTION HEADER ───────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: GREEN },
  sectionTitle: {
    backgroundColor: GREEN, color: '#ffffff',
    fontFamily: 'Helvetica-Bold', fontSize: 10,
    paddingHorizontal: 14, paddingVertical: 4, letterSpacing: 1,
  },

  // ── RECEIVED FROM ────────────────────────────────────────────
  receivedBox: {
    borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 6,
    padding: 12, marginBottom: 10,
  },
  receivedGrid: { flexDirection: 'row' },
  receivedLeft: { flex: 1, paddingRight: 16 },
  receivedRight: { flex: 1 },
  fieldRow: { flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' },
  fieldIcon: { width: 18 },
  fieldLabel: { fontSize: 9.5, color: TEXT_LIGHT, width: 72 },
  fieldColon: { fontSize: 9.5, color: TEXT_LIGHT, width: 6 },
  fieldValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: TEXT_DARK, flex: 1 },

  // ── DONATION TABLE ───────────────────────────────────────────
  table: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 4, marginBottom: 10 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 10, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
  },
  tableHeaderDesc: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEXT_DARK },
  tableHeaderAmt: { width: 90, fontFamily: 'Helvetica-Bold', fontSize: 10, color: TEXT_DARK, textAlign: 'right' },
  tableRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  tableDesc: { flex: 1, fontSize: 9.5, color: TEXT_MID },
  tableAmt: { width: 90, fontSize: 9.5, color: TEXT_DARK, textAlign: 'right' },
  tableTotalRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: GREEN,
  },
  tableTotalLabel: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#ffffff' },
  tableTotalAmt: { width: 90, fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#ffffff', textAlign: 'right' },

  // ── PAYMENT DETAILS ─────────────────────────────────────────
  paymentGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 6,
    padding: 12, marginBottom: 10,
  },
  paymentItem: { alignItems: 'center', flex: 1 },
  paymentIcon: { marginBottom: 4 },
  paymentLabel: { fontSize: 9, color: TEXT_LIGHT, textAlign: 'center' },
  paymentValue: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'center', color: TEXT_DARK },

  // ── FOOTER ───────────────────────────────────────────────────
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  footerQr: { alignItems: 'center' },
  footerQrLabel: { fontSize: 8, color: TEXT_LIGHT, textAlign: 'center', marginTop: 4, maxWidth: 70 },
  footerSign: { alignItems: 'center', flex: 1 },
  footerSignLine: { width: 100, borderTopWidth: 1, borderTopColor: TEXT_DARK, marginBottom: 4 },
  footerSignLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: TEXT_DARK, textAlign: 'center' },
  footerSignSub: { fontSize: 8, color: TEXT_LIGHT, textAlign: 'center' },
  footerStamp: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2, borderColor: '#6b4fa0',
    alignItems: 'center', justifyContent: 'center',
  },
  footerStampText: { fontSize: 7, color: '#6b4fa0', fontFamily: 'Helvetica-Bold', textAlign: 'center' },

  // ── THANK YOU BAR ────────────────────────────────────────────
  thankYouBar: {
    backgroundColor: GREEN_LIGHT, borderWidth: 1, borderColor: BORDER_COLOR,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 10,
  },
  thankYouText: { fontSize: 10, color: TEXT_DARK, flex: 1, textAlign: 'center' },
  thankYouHighlight: { fontFamily: 'Helvetica-Bold', color: GREEN },
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
}: ReceiptProps) => {

  const batchDisplay = [studentClass, batch].filter(Boolean).join(' - ') || 'N/A'
  const amountStr = `${amount.toFixed(2)}`
  const rupeeAmount = `\u20B9 ${amountStr}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Logo circle */}
          <View style={styles.logoBox}>
            <Image
              src={path.join(process.cwd(), 'public', 'logo.png')}
              style={{ width: 76, height: 76, borderRadius: 38 }}
            />
          </View>

          {/* Center: name + tagline */}
          <View style={styles.centerHeader}>
            <Text style={styles.orgName}>VRIKSH</Text>
            <Text style={styles.orgSub}>STUDENTS FEDERATION</Text>
            <View style={styles.dividerLeaf}>
              <View style={styles.dividerLine} />
              <Text style={{ color: GREEN, fontSize: 10, marginHorizontal: 6 }}>🌿</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.tagline}>Together for Education, Together for a Better Tomorrow</Text>
          </View>

          {/* Right: Donation Receipt badge */}
          <View style={styles.badgeBox}>
            {/* Rupee icon in circle */}
            <View style={{ backgroundColor: '#ffffff22', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Helvetica-Bold' }}>₹</Text>
            </View>
            <Text style={styles.badgeTitle}>DONATION{'\n'}RECEIPT</Text>
            {/* Decorative wavy line */}
            <View style={{ marginTop: 4, width: '100%', height: 6 }}>
              <Svg width={64} height={6} viewBox="0 0 64 6">
                <Path d="M0 3 Q8 0 16 3 Q24 6 32 3 Q40 0 48 3 Q56 6 64 3" stroke="#ffffff88" strokeWidth="1.5" fill="none"/>
              </Svg>
            </View>
          </View>
        </View>

        {/* ── RECEIPT INFO ──────────────────────────────────── */}
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Receipt No.</Text>
              <Text style={styles.infoColon}> : </Text>
              <Text style={styles.receiptNumValue}>{receiptNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoColon}> : </Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={{ color: GREEN, fontSize: 12 }}>✓</Text>
            <Text style={styles.verifiedText}>Payment Verified</Text>
          </View>
        </View>

        {/* ── RECEIVED FROM ─────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>  RECEIVED FROM  </Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.receivedBox}>
          <View style={styles.receivedGrid}>
            <View style={styles.receivedLeft}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Name</Text>
                <Text style={styles.fieldColon}> : </Text>
                <Text style={styles.fieldValue}>{studentName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Federation ID</Text>
                <Text style={styles.fieldColon}> : </Text>
                <Text style={styles.fieldValue}>{federationId}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Batch / Class</Text>
                <Text style={styles.fieldColon}> : </Text>
                <Text style={styles.fieldValue}>{batchDisplay}</Text>
              </View>
            </View>
            <View style={styles.receivedRight}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Mobile</Text>
                <Text style={styles.fieldColon}> : </Text>
                <Text style={styles.fieldValue}>{mobileNumber ? `+91 ${mobileNumber}` : 'N/A'}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldColon}> : </Text>
                <Text style={styles.fieldValue}>{email || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── DONATION DETAILS ──────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionTitle}>  DONATION DETAILS  </Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderDesc}>Description</Text>
            <Text style={styles.tableHeaderAmt}>Amount (₹)</Text>
          </View>
          {/* Line items */}
          {(lineItems && lineItems.length > 0 ? lineItems : [{ description: `Donation \u2013 ${periodCovered}`, amount }]).map((item, i) => (
            <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : '#f9fdf9' }]}>
              <Text style={styles.tableDesc}>\u25CF  {item.description}</Text>
              <Text style={styles.tableAmt}>{item.amount.toFixed(2)}</Text>
            </View>
          ))}
          {/* Total row */}
          <View style={styles.tableTotalRow}>
            <Text style={styles.tableTotalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.tableTotalAmt}>{rupeeAmount}</Text>
          </View>
        </View>

        {/* ── PAYMENT INFO GRID ─────────────────────────────── */}
        <View style={styles.paymentGrid}>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Payment Mode</Text>
            <Text style={styles.paymentValue}>{paymentType}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: BORDER_COLOR }} />
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Period Covered</Text>
            <Text style={styles.paymentValue}>{periodCovered}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: BORDER_COLOR }} />
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Payment Date</Text>
            <Text style={styles.paymentValue}>{date}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: BORDER_COLOR }} />
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Received By</Text>
            <Text style={styles.paymentValue}>VSF Admin</Text>
            <Text style={{ fontSize: 8, color: TEXT_LIGHT }}>(Volunteer)</Text>
          </View>
        </View>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <View style={styles.footer}>
          {/* QR placeholder */}
          <View style={styles.footerQr}>
            <View style={{ width: 60, height: 60, borderWidth: 1, borderColor: BORDER_COLOR, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
              <Svg width={52} height={52} viewBox="0 0 52 52">
                {/* Simplified QR pattern */}
                <Rect x="2" y="2" width="20" height="20" fill="none" stroke={GREEN_DARK} strokeWidth="2"/>
                <Rect x="6" y="6" width="12" height="12" fill={GREEN_DARK}/>
                <Rect x="30" y="2" width="20" height="20" fill="none" stroke={GREEN_DARK} strokeWidth="2"/>
                <Rect x="34" y="6" width="12" height="12" fill={GREEN_DARK}/>
                <Rect x="2" y="30" width="20" height="20" fill="none" stroke={GREEN_DARK} strokeWidth="2"/>
                <Rect x="6" y="34" width="12" height="12" fill={GREEN_DARK}/>
                <Rect x="30" y="30" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="36" y="30" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="42" y="30" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="30" y="36" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="42" y="36" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="36" y="42" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="30" y="42" width="4" height="4" fill={GREEN_DARK}/>
                <Rect x="42" y="42" width="4" height="4" fill={GREEN_DARK}/>
              </Svg>
            </View>
            <Text style={styles.footerQrLabel}>Scan to verify this receipt</Text>
          </View>

          {/* Authorized Signatory */}
          <View style={styles.footerSign}>
            {/* Stylized signature curve */}
            <View style={{ height: 30, justifyContent: 'flex-end', marginBottom: 2 }}>
              <Svg width={100} height={28} viewBox="0 0 100 28">
                <Path d="M10 22 Q30 5 50 18 Q65 28 85 8" stroke={GREEN_DARK} strokeWidth="1.5" fill="none"/>
                <Line x1="0" y1="26" x2="100" y2="26" stroke={TEXT_DARK} strokeWidth="0.5"/>
              </Svg>
            </View>
            <Text style={styles.footerSignLabel}>Authorized Signatory</Text>
            <Text style={styles.footerSignSub}>Vriksh Students Federation</Text>
          </View>

          {/* Official Stamp */}
          <View style={styles.footerStamp}>
            <Text style={styles.footerStampText}>VRIKSH{'\n'}STUDENTS{'\n'}FEDERATION</Text>
            <View style={{ width: 40, height: 1, backgroundColor: '#6b4fa0', marginVertical: 3 }} />
            <Text style={{ fontSize: 6, color: '#6b4fa0' }}>OFFICIAL SEAL</Text>
          </View>
        </View>

        {/* ── THANK YOU BAR ─────────────────────────────────── */}
        <View style={styles.thankYouBar}>
          <Text style={{ color: GREEN, fontSize: 14, marginRight: 8 }}>♥</Text>
          <Text style={styles.thankYouText}>
            Thank you for your contribution and support.{' '}
            <Text style={styles.thankYouHighlight}>Your support helps us build a better future!</Text>
          </Text>
        </View>

      </Page>
    </Document>
  )
}
