import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// const data = {
//   no: '',
//   tanggal: '',
//   kirim: '',
//   vendor: {
//     name: '',
//     kontak: '',
//     whatsapp: 'alamat',
//     alamat: ''
//   },
//   items: [
//     {
//       no: 1,
//       kode: '1.23.12.22.233',
//       name: 'Komputer',
//       qty: '12',
//       uom: 'Pcs',
//       harga: `Rp 10.000`,
//       totalHarga: `Rp 120.000`
//     }
//   ]
// }

export default function PDF({data}: {data:any}) {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image
          style={styles.image}
          src="/alfianlogo.png"
        />
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <View style={{ width: "15%", flexDirection: 'column', position: 'relative' }}>
            <View style={{
              borderBottom: 1,
              position: 'absolute',
              top: '50%',
              width: '100%'
            }}
            >
            </View>
          </View>
          <View
            style={{
              width: '70%',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: "black",
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, margin: 3 }}>PURCHASE ORDER (PO)</Text>
          </View>
          <View style={{ width: "15%", flexDirection: 'column', position: 'relative' }}>
            <View style={{
              borderBottom: 1,
              position: 'absolute',
              top: '50%',
              width: '100%'
            }}
            >
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', fontSize: 10, fontWeight: 'light', marginBottom: 30 }}>
          <View style={{ width: '50%' }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>Supplier</Text>
              <Text style={{ width: '70%' }}>: {data.vendor.name}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>Contact Person</Text>
              <Text style={{ width: '70%' }}>: {data.vendor.kontak}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>No. Telpon</Text>
              <Text style={{ width: '70%' }}>: {data.vendor.whatsapp}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>Alamat</Text>
              <Text style={{ width: '70%' }}>: {data.vendor.alamat}</Text>
            </View>
          </View>
          <View style={{ width: '50%' }}>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>No. PO</Text>
              <Text style={{ width: '70%' }}>: {data.no}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>Tanggal PO</Text>
              <Text style={{ width: '70%' }}>: {data.tanggal}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ width: '30%' }}>Tanggal Kirim</Text>
              <Text style={{ width: '70%' }}>: </Text>
            </View>
          </View>
        </View>
        <View style={styles.row} >
          <View style={[styles.col, { width: '5%', borderLeftWidth: 1, borderTopWidth: 1 }]}>
            <Text style={[styles.cell]}>No</Text>
          </View>
          <View style={[styles.col, { width: '15%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell]}>Kode Barang</Text>
          </View>
          <View style={[styles.col, { width: '30%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell]}>Nama</Text>
          </View>
          <View style={[styles.col, { width: '10%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell, { textAlign: 'right' }]}>Qty</Text>
          </View>
          <View style={[styles.col, { width: '10%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell, { textAlign: 'right' }]}>Satuan</Text>
          </View>
          <View style={[styles.col, { width: '15%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell, { textAlign: 'right' }]}>Harga</Text>
          </View>
          <View style={[styles.col, { width: '20%', borderTopWidth: 1 }]}>
            <Text style={[styles.cell, { textAlign: 'right' }]}>Total</Text>
          </View>
        </View>
        <View >
          {data.barang?.map((v:any, i:number) => (
            <View style={styles.row} key={i}>
              <View style={[styles.col, { width: '5%', borderLeftWidth: 1 }]}>
                <Text style={[styles.cell]}>{i + 1}</Text>
              </View>
              <View style={[styles.col, { width: '15%' }]}>
                <Text style={[styles.cell]}>{v.kode}</Text>
              </View>
              <View style={[styles.col, { width: '30%' }]}>
                <Text style={[styles.cell]}>{v.name}</Text>
              </View>
              <View style={[styles.col, { width: '10%' }]}>
                <Text style={[styles.cell, { textAlign: 'right' }]}>{v.qty}</Text>
              </View>
              <View style={[styles.col, { width: '10%' }]}>
                <Text style={[styles.cell, { textAlign: 'right' }]}>{v.uom}</Text>
              </View>
              <View style={[styles.col, { width: '15%' }]}>
                <Text style={[styles.cell, { textAlign: 'right' }]}>{v.harga}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={[styles.cell, { textAlign: 'right' }]}>{v.totalHarga}</Text>
              </View>
            </View>
          ))}
          <View style={{
            flexDirection: 'row-reverse'
          }} >
            <View style={[styles.col, { width: '19.25%', borderLeftWidth: 1 }]}>
              <Text style={[styles.cell, { textAlign: 'right' }]}>{data.total}</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    // paddingBottom: 65,
    paddingHorizontal: 10,
  },
  tableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  cell: {
    margin: 5,
    fontSize: 10,
  },
  image: {
    marginTop: 15,
    marginHorizontal: "auto",
    height: '40px',
    width:'200px'
  },
});