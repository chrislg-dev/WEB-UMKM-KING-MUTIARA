const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadAdminProducts();

    // Event saat form tambah produk di-submit
    document.getElementById("product-form").addEventListener("submit", createProduct);
});

// 1. Ambil Kategori untuk Dropdown
function loadCategories() {
    const select = document.getElementById("form-category");
    fetch(`${API_URL}/categories`)
        .then(res => res.json())
        .then(categories => {
            categories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.id;
                opt.textContent = `${cat.name} (${cat.prefix})`;
                select.appendChild(opt);
            });
        });
}

// 2. Ambil & Tampilkan Produk di Tabel Admin
function loadAdminProducts() {
    const tbody = document.getElementById("admin-table-body");
    fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(products => {
            tbody.innerHTML = "";
            if (products.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Belum ada produk</td></tr>`;
                return;
            }

            products.forEach(p => {
    const tr = document.createElement("tr");
    
    // 1. Format harga ke Rupiah
    const formattedPrice = new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR", 
        minimumFractionDigits: 0 
    }).format(p.Harga);

    const imgFile = p.gambar ? p.gambar : 'logo.jpg';

    // 2. Susun struktur tabel (Data disimpan aman di dalam atribut data-*)
    tr.innerHTML = `
        <td><strong>${p.sku_code}</strong></td>
        <td><img src="images/${imgFile}" width="50" height="50" style="object-fit:cover; border-radius:4px;"></td>
        <td>${p.Nama_Produk}</td>
        <td>${p.Kategori}</td>
        <td>${formattedPrice}</td>
        <td>
            <button class="btn-edit-product" 
                    style="background:#007bff; padding: 6px 12px; margin-bottom: 6px; display: block; width: 80px; border:none; color:white; border-radius:4px; cursor:pointer;"
                    data-id="${p.id}"
                    data-name="${p.Nama_Produk}"
                    data-price="${p.Harga}"
                    data-category="${p.category_id || 1}"
                    data-image="${p.gambar || ''}">
                Edit
            </button>
            
            <button class="btn-delete" style="padding: 6px 12px; display: block; width: 80px;" onclick="deleteProduct(${p.id})">
                Hapus
            </button>
        </td>
    `;

    // 3. Pasang fungsi klik otomatis untuk tombol Edit di atas agar melempar data ke form
    const editBtn = tr.querySelector(".btn-edit-product");
    editBtn.addEventListener("click", function() {
        const id = this.getAttribute("data-id");
        const name = this.getAttribute("data-name");
        const price = this.getAttribute("data-price");
        const category_id = this.getAttribute("data-category");
        const gambar = this.getAttribute("data-image");

        // Panggil fungsi isi form yang sudah kamu buat
        editProduct(id, name, price, category_id, gambar);
    });

    tbody.appendChild(tr);
});
});
}


// 3. Handle Tambah Baru (POST) ATAU Simpan Perubahan (PUT)
function createProduct(e) {
    e.preventDefault();

    // Kita cek apakah ada ID produk di input hidden
    const productId = document.getElementById("form-id").value; 
    
    const productData = {
        category_id: document.getElementById("form-category").value,
        name: document.getElementById("form-name").value,
        price: document.getElementById("form-price").value,
        image: document.getElementById("form-image").value || 'logo.jpg'
    };

    // JIKA form-id ADA ISINYA = MODE EDIT (PUT)
    // JIKA form-id KOSONG = MODE TAMBAH BARU (POST)
    const isEdit = productId !== "";
    const url = isEdit ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        
        // Kembalikan form ke keadaan semula (Mode Tambah Berubah Kembali)
        document.getElementById("product-form").reset();
        document.getElementById("form-id").value = ""; 
        document.getElementById("form-title").textContent = "Tambah Produk Baru";
        document.getElementById("btn-submit").textContent = "Simpan Produk";
        
        loadAdminProducts(); // Refresh tabel biar data terbaru langsung muncul
    })
    .catch(err => {
        console.error(err);
        alert("Gagal memproses data produk");
    });
}

// 4. Fungsi Mengisi Form Atas dengan Data dari Baris Tabel yang Diklik (Pemicu Tombol Edit)
function editProduct(id, name, price, category_id, gambar) {
    // A. Ubah judul kartu form dan teks tombol submit
    document.getElementById("form-title").textContent = "Edit Produk";
    document.getElementById("btn-submit").textContent = "Simpan Perubahan";

    // B. Masukkan data produk lama ke dalam kotak input form
    document.getElementById("form-id").value = id;
    document.getElementById("form-name").value = name;
    document.getElementById("form-price").value = price;
    document.getElementById("form-category").value = category_id;
    document.getElementById("form-image").value = gambar;
    
    // C. Otomatis scroll layar ke atas dengan halus agar admin langsung fokus ke form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
// 4. Fungsi Hapus Produk
function deleteProduct(id) {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
        fetch(`${API_URL}/products/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                loadAdminProducts(); // Refresh tabel setelah dihapus
            })
            .catch(err => alert("Gagal menghapus produk"));
    }
}
