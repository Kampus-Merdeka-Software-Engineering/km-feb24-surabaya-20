// Fungsi untuk memuat data dari file JSON
async function loadSalesData() {
  const response = await fetch("salesData.json");
  const data = await response.json();
  return data;
}

// Variabel untuk melacak indeks awal dan akhir data yang ditampilkan
let startIndex = 0;
const itemsPerPage = 10;

// Fungsi untuk mengisi tabel dengan data penjualan sesuai dengan rentang indeks
async function fillSalesTable() {
  const rawData = await loadSalesData();

  const tableBody = document.querySelector("#salesTable tbody");
  tableBody.innerHTML = "";

  // Mengambil data untuk halaman saat ini berdasarkan rentang indeks
  const currentPageData = rawData.slice(startIndex, startIndex + itemsPerPage);

  currentPageData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${item.transaction_id}</td>
            <td>${item.transaction_date}</td>
            <td>${item.transaction_time}</td>
            <td>${item.transaction_qty}</td>
            <td>${item.store_id}</td>
            <td>${item.store_location}</td>
            <td>${item.product_id}</td>
            <td>${item.unit_price}</td>
            <td>${item.product_category}</td>
            <td>${item.product_type}</td>
            <td>${item.product_detail}</td>
        `;
    tableBody.appendChild(row);
  });

  // Menampilkan atau menyembunyikan tombol panah berikutnya sesuai dengan kondisi
  const nextButton = document.getElementById("nextButton");
  if (startIndex + itemsPerPage >= rawData.length) {
    nextButton.style.display = "none";
  } else {
    nextButton.style.display = "block";
  }

  // Menampilkan atau menyembunyikan tombol panah sebelumnya sesuai dengan kondisi
  const prevButton = document.getElementById("prevButton");
  if (startIndex === 0) {
    prevButton.style.display = "none";
  } else {
    prevButton.style.display = "block";
  }
}

// Fungsi untuk menangani klik tombol panah berikutnya
function nextButtonClick() {
  startIndex += itemsPerPage;
  fillSalesTable();
}

// Fungsi untuk menangani klik tombol panah sebelumnya
function prevButtonClick() {
  startIndex -= itemsPerPage;
  fillSalesTable();
}

// Panggil fungsi untuk mengisi tabel saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  fillSalesTable();
});

// Fungsi untuk mengolah data penjualan per bulan
async function processMonthlySalesData() {
  const rawData = await loadSalesData();
  const salesData = {};

  rawData.forEach((item) => {
    const [month, day, year] = item.transaction_date.split("/");
    const dateKey = `${year}-${month.padStart(2, "0")}`; // Membuat key dengan format 'YYYY-MM'

    const quantity = parseInt(item.transaction_qty);
    const unitPrice = parseFloat(item.unit_price.replace("$", ""));
    const totalSales = quantity * unitPrice;

    if (salesData[dateKey]) {
      salesData[dateKey] += totalSales;
    } else {
      salesData[dateKey] = totalSales;
    }
  });

  const labels = Object.keys(salesData).sort(); // Mengurutkan berdasarkan tanggal
  const data = labels.map((label) => salesData[label]);

  return { labels, data };
}

// Fungsi untuk menginisialisasi chart dengan data dari JSON
async function initChart() {
  const chartData = await processMonthlySalesData();

  const salesData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Sales Trend",
        data: chartData.data,
        backgroundColor: "rgba(182, 137, 91, 0.2)",
        borderColor: "rgba(182, 137, 91, 1)",
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const config = {
    type: "line",
    data: salesData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const salesChart = new Chart(document.getElementById("salesChart"), config);
}

// Panggil fungsi untuk menginisialisasi chart saat halaman dimuat
document.addEventListener("DOMContentLoaded", initChart);
