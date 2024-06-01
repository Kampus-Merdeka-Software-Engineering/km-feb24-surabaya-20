// Fungsi untuk memuat data dari file JSON
async function loadSalesData() {
  const response = await fetch("salesData.json");
  const data = await response.json();
  return data;
}

// Fungsi untuk mengolah data penjualan per bulan
async function processMonthlySalesData() {
  const rawData = await loadSalesData();
  const salesData = {};

  rawData.forEach((item) => {
    const [month, day, year] = item.transaction_date.split("/");
    const dateKey = `${year}-${month.padStart(2, "0")}`; // Membuat key dengan format 'YYYY-MM'

    const quantity = parseInt(item.transaction_qty, 10);
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
        label: "Total Sales",
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

// Fungsi untuk mengolah data penjualan berdasarkan kategori
async function processSalesDataByCategory() {
  const rawData = await loadSalesData();
  const salesDataByCategory = {};

  rawData.forEach((item) => {
    const category = item.product_category;
    const quantity = parseInt(item.transaction_qty, 10);

    if (salesDataByCategory[category]) {
      salesDataByCategory[category].totalQuantity += quantity;
    } else {
      salesDataByCategory[category] = { totalQuantity: quantity };
    }
  });

  return salesDataByCategory;
}

// Fungsi untuk menginisialisasi grafik Products Sold by Category
async function initProductsSoldByCategoryChart() {
  const salesDataByCategory = await processSalesDataByCategory();

  const labels = Object.keys(salesDataByCategory);
  const data = labels.map(
    (category) => salesDataByCategory[category].totalQuantity
  );

  const productsSoldByCategoryData = {
    labels: labels,
    datasets: [
      {
        label: "Products Sold",
        data: data,
        backgroundColor: "#8b5a5a",
      },
    ],
  };

  const config = {
    type: "bar",
    data: productsSoldByCategoryData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  new Chart(document.getElementById("productsSoldByCategoryChart"), config);
}

// Panggil fungsi untuk menginisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", async () => {
  await initChart();
  await initProductsSoldByCategoryChart();
});
