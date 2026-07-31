import React, { useState, useEffect } from 'react';

export default function App() {
  const [dataSampah, setDataSampah] = useState([]);
  const [formData, setFormData] = useState({
    tanggal: '', jam: '', pengirim: '', penerima: '', asal: '', keterangan: ''
  });
  
  const [jumlahPerKategori, setJumlahPerKategori] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const daftarAsal = [
    "Kantor Pusat", "Masjid Kampus UNDIP", "RSND", "ICT", "PEMKOT",
    "PKM STUDENT CENTER", "Gedung Prof. Sudarto", "Makam Keluarga UNDIP",
    "PT. Mandiri", "Rusunawa", "PAUD", "Stadion", "Lab. Terpadu", "SPBU",
    "F. Psikologi", "F. Teknik", "F. Sains dan Matematika",
    "F. Perikanan dan Ilmu Kelautan", "F. Kedokteran", "F. Ekonomika dan Bisnis",
    "F. Kesehatan Masyarakat", "F. Hukum", "F. Ilmu Budaya",
    "F. Ilmu Sosial dan Ilmu Politik", "F. Peternakan dan Pertanian", "Sekolah Vokasi"
  ];

  const strukturKategori = {
    'ORGANIK': ['Daun', 'Ranting', 'Sisa Makanan'],
    'ANORGANIK': ['Plastik non Multilayer', 'Styrofom', 'Plastik Multilayer (Foil, Sachet, Mika dll)', 'Toiletries (Tissue, Residu dll)'],
    'B3': ['Botol Kaca, Limbah Cair, dll'],
    'LAINNYA': ['Lainnya (jika ada)']
  };

  useEffect(() => {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const dateString = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
    setFormData(prev => ({ ...prev, tanggal: dateString, jam: timeString }));
  }, []);

  const showMessage = (msg, type = 'error') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJumlahChange = (subKategori, value) => {
    setJumlahPerKategori(prev => {
      if (value === '') {
        const newState = { ...prev };
        delete newState[subKategori];
        return newState;
      }
      return { ...prev, [subKategori]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (Object.keys(jumlahPerKategori).length === 0) {
      showMessage("Silakan isi jumlah (kg) minimal pada satu jenis sampah!", "error");
      return;
    }

    const newData = {
      ...formData,
      jumlahDetail: jumlahPerKategori,
      waktuInput: new Date().toISOString()
    };

    setDataSampah(prev => [newData, ...prev]);
    
    // Reset form setelah simpan (Tanggal & Penerima dipertahankan untuk kemudahan)
    const now = new Date();
    setFormData(prev => ({ 
      tanggal: prev.tanggal,
      jam: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'), 
      pengirim: '', penerima: prev.penerima, asal: '', keterangan: '' 
    }));
    
    setJumlahPerKategori({});
    showMessage("Data sampah berhasil disimpan!", "success");
  };

  const exportToCSV = () => {
    if (dataSampah.length === 0) {
      showMessage("Belum ada data yang bisa di-export hari ini.", "error");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // 1. MENGELOMPOKKAN DATA BERDASARKAN TANGGAL
    const groupedData = dataSampah.reduce((acc, curr) => {
      if (!acc[curr.tanggal]) acc[curr.tanggal] = [];
      acc[curr.tanggal].push(curr);
      return acc;
    }, {});

    // 2. MENGURUTKAN TANGGAL (Dari yang terbaru ke terlama)
    const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

    // 3. MEMBUAT TABEL TERPISAH UNTUK SETIAP TANGGAL BERSUSUN KE BAWAH
    sortedDates.forEach(dateStr => {
      const reportDateObj = new Date(dateStr);
      const namaHariArr = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const namaHari = namaHariArr[reportDateObj.getDay()];
      const tanggalHeader = `${reportDateObj.getDate().toString().padStart(2, '0')}/${(reportDateObj.getMonth() + 1).toString().padStart(2, '0')}/${reportDateObj.getFullYear()}`;

      // BARIS 1 & 2: Header Hari dan Tanggal (Ditempatkan di tengah/kolom G)
      csvContent += `,,,,,,${namaHari}\n`;
      csvContent += `,,,,,,${tanggalHeader}\n`;
      
      // BARIS 3: Title Jenis Sampah
      csvContent += `,,,,,,Jenis Sampah & Jumlah (kg)\n`;
      
      // BARIS 4: Kategori Induk
      csvContent += `,,,,,,ORGANIK,,,ANORGANIK,,,,B3,LAINNYA\n`;
      
      // BARIS 5: Header Kolom Lengkap
      csvContent += `Lokasi Asal,No.,Jam Kedatangan,Petugas Pengirim,Petugas Penerima,Keterangan,Daun,Ranting,Sisa Makanan,Plastik non Multilayer,Styrofom,"Plastik Multilayer (Foil, Sachet, Mika dll)","Toiletries (Tissue, Residu dll)","Botol Kaca, Limbah Cair, dll","Lainnya (jika ada)"\n`;
      
      const urutanKolomSub = [
        'Daun', 'Ranting', 'Sisa Makanan', 
        'Plastik non Multilayer', 'Styrofom', 'Plastik Multilayer (Foil, Sachet, Mika dll)', 'Toiletries (Tissue, Residu dll)',
        'Botol Kaca, Limbah Cair, dll', 'Lainnya (jika ada)'
      ];

      // Mengurutkan data di tanggal tersebut berdasarkan lokasi asal (A-Z)
      const sortedRows = groupedData[dateStr].sort((a, b) => a.asal.localeCompare(b.asal));

      sortedRows.forEach((row, index) => {
        let rowArray = [
          `"${row.asal}"`,       // Kolom A: Lokasi Asal
          index + 1,             // Kolom B: No
          `"${row.jam}"`,        // Kolom C: Jam Kedatangan
          `"${row.pengirim}"`,   // Kolom D: Petugas Pengirim
          `"${row.penerima}"`,   // Kolom E: Petugas Penerima
          `"${row.keterangan.replace(/\r?\n|\r/g, " ")}"` // Kolom F: Keterangan
        ];

        urutanKolomSub.forEach(sub => {
          rowArray.push(row.jumlahDetail[sub] || '');
        });

        csvContent += rowArray.join(",") + "\n";
      });
      
      // Menambahkan 3 baris kosong sebagai pemisah antar tabel/tanggal
      csvContent += "\n\n\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Harian_Sampah_UNDIP.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-gray-800 font-sans relative">
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-6 py-3 rounded-lg shadow-xl font-medium text-white flex items-center gap-3 ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* HEADER MURNI TANPA GARIS */}
      <header className="bg-[#03045E] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 relative">
            <div className="flex-shrink-0 z-10">
              {/* Ganti tulisan logo.png di bawah ini dengan nama file Anda jika berbeda */}
              <img src="logo.png" alt="Logo UNDIP" className="h-14 w-14 object-contain" />
            </div>
            <div className="absolute left-0 w-full text-center pl-16 pr-4 sm:pl-0 sm:pr-0 pointer-events-none">
              <p className="text-[10px] sm:text-xs font-light tracking-[0.2em] text-blue-100 opacity-90">PENDATAAN SAMPAH</p>
              <h1 className="text-sm sm:text-lg md:text-xl font-bold uppercase tracking-wider mt-0.5 text-white">Universitas Diponegoro</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-[#03045E] to-[#0077B6] px-6 py-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              Form Input Data Harian
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* Bagian 1: Informasi Kedatangan (Ditambah TANGGAL) */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-[#03045E] flex items-center gap-2 mb-4">
                <span className="bg-[#03045E] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Informasi Waktu & Petugas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Pendataan</label>
                  <input type="date" name="tanggal" value={formData.tanggal} onChange={handleInputChange} required 
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Kedatangan</label>
                  <input type="time" name="jam" value={formData.jam} onChange={handleInputChange} required 
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Petugas Pengirim</label>
                  <input type="text" name="pengirim" value={formData.pengirim} onChange={handleInputChange} required placeholder="Nama pengirim sampah"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Petugas Penerima</label>
                  <input type="text" name="penerima" value={formData.penerima} onChange={handleInputChange} required placeholder="Nama penerima di lokasi"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm" />
                </div>
              </div>
            </div>

            {/* Bagian 2: Lokasi Asal */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-lg font-semibold text-[#03045E] flex items-center gap-2 mb-4">
                <span className="bg-[#03045E] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Lokasi Asal Sampah
              </h3>
              <div>
                <select name="asal" value={formData.asal} onChange={handleInputChange} required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm cursor-pointer">
                  <option value="" disabled>-- Klik untuk memilih lokasi asal --</option>
                  {daftarAsal.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            {/* Bagian 3: Input Jumlah Sampah (KG) */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#03045E] flex items-center gap-2">
                  <span className="bg-[#03045E] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Input Jumlah Sampah (KG)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">*Isi angka (kg) pada kolom yang sesuai. Kosongkan jika tidak ada.</p>
              
              <div className="space-y-6">
                {Object.entries(strukturKategori).map(([kategoriInduk, subKategoriList]) => (
                  <div key={kategoriInduk} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-[#E2E8F0] px-4 py-2 font-bold text-[#03045E] border-b border-gray-200">
                      {kategoriInduk}
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subKategoriList.map(sub => (
                        <div key={sub} className="flex flex-col gap-1">
                          <label className="text-sm text-gray-700 font-medium">{sub}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0"
                              value={jumlahPerKategori[sub] || ''}
                              onChange={(e) => handleJumlahChange(sub, e.target.value)}
                              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#03045E] focus:border-[#03045E] outline-none text-sm transition-all"
                            />
                            <span className="absolute right-3 top-2 text-gray-400 text-sm font-medium">kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian 4: Keterangan */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#03045E] flex items-center gap-2">
                  <span className="bg-[#03045E] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Keterangan Tambahan
                </h3>
              </div>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} rows="2" placeholder="Tambahkan catatan khusus (Opsional)..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03045E] focus:border-[#03045E] text-sm outline-none transition-all shadow-sm resize-y"></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" 
                className="bg-[#03045E] hover:bg-[#020344] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                SIMPAN DATA
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Data Rekap */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#F8FAFC] px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#03045E] p-2 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#03045E]">Riwayat Pendataan</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Total Data: <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{dataSampah.length} Entri</span></p>
              </div>
            </div>
            <button onClick={exportToCSV} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export ke Excel (CSV Sesuai Format)
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-white uppercase bg-[#0077B6]">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Lokasi Asal</th>
                  <th className="px-6 py-4">Rincian Sampah (kg)</th>
                  <th className="px-6 py-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataSampah.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 bg-gray-50">
                      <p className="font-medium text-base text-gray-500">Belum ada data yang tercatat.</p>
                    </td>
                  </tr>
                ) : (
                  // Menampilkan data di tabel web (urutannya tetap berdasarkan waktu input terbaru)
                  dataSampah.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-[#F3F8FB] transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-[#03045E]">{item.tanggal}</div>
                        <div className="text-xs text-gray-500 font-semibold mt-0.5">{item.jam}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{item.asal}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {Object.entries(item.jumlahDetail).map(([kategori, jumlah]) => (
                            <div key={kategori} className="text-xs">
                              <span className="font-medium text-gray-700">{kategori}:</span> <span className="text-[#0077B6] font-bold">{jumlah} kg</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div><span className="font-medium">Pengirim:</span> {item.pengirim}</div>
                          <div><span className="font-medium">Penerima:</span> {item.penerima}</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}