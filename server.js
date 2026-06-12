const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // <--- 1. TAMBAHKAN MODUL CORS DI SINI

const app = express();

// MIDDLEWARE
app.use(cors()); // <--- 2. AKTIFKAN CORS AGAR FRONTEND BISA MENGAKSES BACKEND INI
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', 
    database: 'kingmutiara'
});

db.connect((err) => {
    if(err){
        console.log(err);
    } else {
        console.log('Database Connected!');
    }
});

// --- TEMPAT MEMBUAT RUTE UNTUK KIRIM FEEDBACK ---
app.post('/api/feedback', (req, res) => {
    // Mengambil data nama dan pesan yang dikirim oleh user
    const { nama, pesan } = req.body; 

    // Query SQL untuk memasukkan data ke tabel feedback
    const sql = "INSERT INTO feedback (nama, pesan) VALUES (?, ?)";
    
    db.query(sql, [nama, pesan], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Gagal menyimpan feedback" });
        }
        // Jika berhasil, kirim respon balik ke frontend
        res.status(200).json({ success: true, message: "Feedback berhasil disimpan!" });
    });
});


// --- PINTU UNTUK MENYIMPAN PRODUK DENGAN SKU BERURUTAN (Contoh: FLR-001) ---
app.post('/api/products', (req, res) => {
    const { category_id, name, price, image } = req.body;

    // 1. Ambil nama prefix dari tabel categories berdasarkan category_id yang dipilih
    db.query('SELECT prefix FROM categories WHERE id = ?', [category_id], (err, catResult) => {
        if (err || catResult.length === 0) {
            console.log("Error mengambil prefix:", err);
            return res.status(500).json({ message: "Kategori tidak ditemukan" });
        }

        const prefix = catResult[0].prefix; // Mendapatkan tulisan seperti 'FLR'

        // 2. Hitung ada berapa banyak produk yang sudah menggunakan kategori ini
        db.query('SELECT COUNT(*) AS total FROM products WHERE category_id = ?', [category_id], (err, countResult) => {
            if (err) {
                console.log("Error menghitung jumlah produk:", err);
                return res.status(500).json({ message: "Gagal menghitung urutan SKU" });
            }

            // Urutan berikutnya adalah jumlah produk saat ini + 1
            const urutanBerikutnya = countResult[0].total + 1;

            // 3. Format angka agar menjadi 3 digit (misal: angka 2 menjadi '002', angka 15 menjadi '015')
            const nomorFormat = String(urutanBerikutnya).padStart(3, '0');

            // Gabungkan prefix dan nomor format menjadi SKU utuh (Contoh: FLR-001)
            const sku_code = `${prefix}-${nomorFormat}`;

            // 4. Masukkan data produk baru ke database
            const sql = "INSERT INTO products (category_id, sku_code, name, price, gambar) VALUES (?, ?, ?, ?, ?)";
            
            db.query(sql, [category_id, sku_code, name, price, image], (err, result) => {
                if (err) {
                    console.log("Error SQL Internal saat INSERT:", err);
                    return res.status(500).json({ message: "Gagal menyimpan produk ke database" });
                }
                res.status(200).json({ message: `Produk berhasil disimpan dengan Kode SKU: ${sku_code}!` });
            });
        });
    });
});

// --- PINTU UNTUK MENGHAPUS PRODUK BERDASARKAN ID ---
app.delete('/api/products/:id', (req, res) => {
    // Mengambil ID produk yang dikirim dari URL (misal: /api/products/5)
    const { id } = req.params;

    // Query SQL untuk menghapus data berdasarkan ID produk tersebut
    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log("Error SQL saat menghapus produk:", err); // Muncul di terminal jika gagal
            return res.status(500).json({ success: false, message: "Gagal menghapus produk dari database" });
        }

        // Jika berhasil, kirim respon balik ke admin.js
        res.status(200).json({ success: true, message: "Produk berhasil dihapus secara permanen!" });
    });
});


app.get('/api/products', (req, res) => {
    // PERBAIKAN: p.gambar sekarang ikut diambil dari database
    const sql = `
        SELECT p.id, p.sku_code, p.name AS Nama_Produk, p.price AS Harga, p.gambar, c.name AS Kategori 
        FROM products p
        JOIN categories c ON p.category_id = c.id
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Gagal mengambil data produk" });
        }
        res.status(200).json(results);
    });
});

app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Gagal mengambil kategori" });
        }
        res.status(200).json(results);
    });
});

// --- PINTU UNTUK MENGEDIT/UPDATE DATA PRODUK BERDASARKAN ID ---
app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { category_id, name, price, image } = req.body;

    const sql = `
        UPDATE products 
        SET category_id = ?, name = ?, price = ?, gambar = ? 
        WHERE id = ?
    `;

    db.query(sql, [category_id, name, price, image, id], (err, result) => {
        if (err) {
            console.log("Error SQL saat mengedit produk:", err);
            return res.status(500).json({ message: "Gagal memperbarui data produk di database" });
        }
        res.status(200).json({ message: "Produk berhasil diperbarui!" });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});