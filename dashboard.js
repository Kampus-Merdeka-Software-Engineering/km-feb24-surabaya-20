// Fungsi untuk memuat data dari file JSON
async function loadSalesData() {
  const response = await fetch("sales_data.json");
  const data = await response.json();
  return data;
}

// Fungsi untuk memproses data penjualan berdasarkan filter lokasi
function filterDataByLocation(data, location) {
  if (location === "All") {
    return data;
  }
  return data.filter((item) => item.store_location === location);
}

// Fungsi untuk mengolah data penjualan per bulan
async function processMonthlySalesData(location) {
  const rawData = await loadSalesData();
  const filteredData = filterDataByLocation(rawData, location);
  const salesData = {};

  filteredData.forEach((item) => {
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
async function initChart(chartData) {
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

  const ctx = document.getElementById("salesChart").getContext("2d");
  if (window.salesChart instanceof Chart) {
    window.salesChart.destroy();
  }
  window.salesChart = new Chart(ctx, config);
}

// Fungsi untuk mengolah data penjualan berdasarkan kategori
async function processSalesDataByCategory(location) {
  const rawData = await loadSalesData();
  const filteredData = filterDataByLocation(rawData, location);
  const salesDataByCategory = {};

  filteredData.forEach((item) => {
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
async function initProductsSoldByCategoryChart(salesDataByCategory) {
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

  const ctx = document
    .getElementById("productsSoldByCategoryChart")
    .getContext("2d");
  if (window.productsSoldByCategoryChart instanceof Chart) {
    window.productsSoldByCategoryChart.destroy();
  }
  window.productsSoldByCategoryChart = new Chart(ctx, config);
}

// Fungsi untuk mengolah data penjualan per minggu berdasarkan kategori
async function processWeeklySalesDataByCategory(location) {
  const rawData = await loadSalesData();
  const filteredData = filterDataByLocation(rawData, location);
  const salesDataByCategory = {};

  filteredData.forEach((item) => {
    const [month, day, year] = item.transaction_date.split("/");
    const dateKey = new Date(year, month - 1, day);
    const startOfYear = new Date(dateKey.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((dateKey - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    const week = `${year}-W${String(weekNumber).padStart(2, "0")}`; // Membuat key dengan format 'YYYY-WW'
    const category = item.product_category;
    const quantity = parseInt(item.transaction_qty, 10);
    const unitPrice = parseFloat(item.unit_price.replace("$", ""));
    const totalSales = quantity * unitPrice;

    if (!salesDataByCategory[category]) {
      salesDataByCategory[category] = {};
    }

    if (salesDataByCategory[category][week]) {
      salesDataByCategory[category][week] += totalSales;
    } else {
      salesDataByCategory[category][week] = totalSales;
    }
  });

  return salesDataByCategory;
}

// Fungsi untuk menginisialisasi chart dengan data dari JSON
async function initSalesTrendByCategoryChart(salesDataByCategory) {
  const categories = Object.keys(salesDataByCategory);
  const weeks = [
    ...new Set(Object.values(salesDataByCategory).flatMap(Object.keys)),
  ].sort();
  const datasets = categories.map((category) => {
    const data = weeks.map((week) => salesDataByCategory[category][week] || 0);
    return {
      label: category,
      data: data,
      borderWidth: 1,
      fill: false,
    };
  });

  const config = {
    type: "line",
    data: {
      labels: weeks,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  const ctx = document
    .getElementById("salesTrendByCategoryChart")
    .getContext("2d");
  if (window.salesTrendByCategoryChart instanceof Chart) {
    window.salesTrendByCategoryChart.destroy();
  }
  window.salesTrendByCategoryChart = new Chart(ctx, config);
}

// Panggil fungsi untuk menginisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", async () => {
  const storeLocationSelect = document.getElementById("storeLocationSelect");

  // Initialize charts with 'All' location
  let location = storeLocationSelect.value;
  let chartData = await processMonthlySalesData(location);
  let salesDataByCategory = await processSalesDataByCategory(location);
  let weeklySalesDataByCategory = await processWeeklySalesDataByCategory(
    location
  );
  await initChart(chartData);
  await initProductsSoldByCategoryChart(salesDataByCategory);
  await initSalesTrendByCategoryChart(weeklySalesDataByCategory);

  // Add event listener for store location filter change
  storeLocationSelect.addEventListener("change", async (event) => {
    location = event.target.value;
    chartData = await processMonthlySalesData(location);
    salesDataByCategory = await processSalesDataByCategory(location);
    weeklySalesDataByCategory = await processWeeklySalesDataByCategory(
      location
    );
    await initChart(chartData);
    await initProductsSoldByCategoryChart(salesDataByCategory);
    await initSalesTrendByCategoryChart(weeklySalesDataByCategory);
  });
});
