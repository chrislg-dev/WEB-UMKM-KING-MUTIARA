// --- LOGIKA MENU HAMBURGER & NAVBAR (Kodingan Asli Kamu) ---
let menuIcon = document.querySelector("#menu-icon");
let navlist = document.querySelector(".navlist");

menuIcon.onclick = () => {
    menuIcon.classList.toggle("bx-x");
    navlist.classList.toggle("open");
};

window.onscroll = () => {
    menuIcon.classList.remove("bx-x");
    navlist.classList.remove("open");
};

const header = document.querySelector("header");

window.addEventListener("scroll", function () {
    header.classList.toggle("sticky", window.scrollY > 50);
});

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Menahan halaman agar tidak reload/segar ulang saat tombol diklik

            const namaUser = document.getElementById('name').value;
            const pesanUser = document.getElementById('message').value;
            const dataFeedback = {
                nama: namaUser,
                pesan: pesanUser
            };

            fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataFeedback)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Sukses! ' + data.message);
                    contactForm.reset();
                } else {
                    alert('Gagal: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error saat fetch:', error);
                alert('Gagal terhubung ke server! Pastikan Node.js (server.js) sudah kamu jalankan.');
            });
        });
    }
});

// Fungsi untuk mengambil data produk dari backend dan menampilkannya di web
function loadProducts() {
    const container = document.getElementById('product-container');
    
    // Cek dulu apakah kita sedang berada di halaman yang ada 'product-container'-nya
    if (!container) return; 

    fetch('http://localhost:3000/api/products')
        .then(response => response.json())
        .then(products => {
            container.innerHTML = ''; // Bersihkan wadah sebelum diisi

            if (products.length === 0) {
                container.innerHTML = '<p>Belum ada produk yang tersedia.</p>';
                return;
            }

            // Looping isi produk dari database dan buat struktur HTML-nya
                products.forEach(product => {
                // 1. Ambil nama file dari database atau gunakan 'logo.jpg' jika kosong
                const namaFile = product.gambar ? product.gambar : 'logo.jpg'; 

                // 2. PERBAIKAN: Jika namanya bukan 'logo.jpg', arahkan jalurnya ke dalam folder 'images/'
                // Namun jika isinya 'logo.jpg' (dan logonya ada di folder utama), biarkan tanpa folder 'images/'
                const gambarProduk = (namaFile === 'logo.jpg') ? namaFile : `images/${namaFile}`; 

                const productCard = `
                <article class="product-card">
                    <div class="product-image">
                        <img src="${gambarProduk}" alt="${product.Nama_Produk}" class="product-img">
                    </div>
                    <div class="product-details">
                        <small style="color: #888; font-weight: bold;">${product.sku_code}</small>
                        <h3>${product.Nama_Produk}</h3>
                        <div class="product-meta">
                            <span class="product-price">Rp ${Number(product.Harga).toLocaleString('id-ID')}</span>
                            <span class="product-tag">${product.Kategori}</span>
                        </div>
                    </div>
                </article>
                `;
                container.innerHTML += productCard;
            });
        })
        .catch(error => {
            console.error('Error saat mengambil produk:', error);
            container.innerHTML = '<p>Gagal memuat produk. Pastikan server menyala!</p>';
        });
}

// Jalankan fungsi ini otomatis saat halaman web selesai dimuat
document.addEventListener('DOMContentLoaded', loadProducts);

document.querySelectorAll('.faq-card').forEach((el) => {
  const summary = el.querySelector('summary');
  const wrapper = el.querySelector('.faq-wrapper');

  summary.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah fungsi bawaan agar bisa dianimasikan manual
    
    if (el.hasAttribute('open')) {
      // Proses Menutup: Kecilkan grid dulu, lalu hapus atribut 'open' setelah animasi selesai
      wrapper.style.gridTemplateRows = '0fr';
      setTimeout(() => {
        el.removeAttribute('open');
      }, 100); // Harus sama dengan durasi di CSS (0.4s)
    } else {
      // Proses Membuka: Beri atribut 'open' lalu expand grid-nya
      el.setAttribute('open', '');
      setTimeout(() => {
        wrapper.style.gridTemplateRows = '1fr';
      }, 10); // Delay kecil agar browser sempat membaca perubahan atribut sebelum animasi dimulai
    }
  });
});