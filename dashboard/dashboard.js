let dataByLocation = {};
let salesTrendChart = null;
let productsSoldByCategoryChart = null;
let salesTrendByCategoryWeekChart = null;
const selectElement = document.getElementById("storeLocationSelect");

// Function to get a color from a predefined palette
function getColor(index) {
  const palette = [
    "#FF5733", // Red
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33A1", // Pink
    "#FF8F33", // Orange
    "#33FFF5", // Cyan
    "#8D33FF", // Purple
    "#F3FF33", // Yellow
    "#33FF8F", // Light Green
  ];
  return palette[index % palette.length];
}

// Function to initialize the dashboard
function initDashboard() {
  // Fetch data from JSON file
  fetch("sales_trend.json")
    .then((response) => response.json())
    .then((data) => {
      dataByLocation = data.reduce((acc, entry) => {
        if (!acc[entry.store_location]) {
          acc[entry.store_location] = [];
        }
        acc[entry.store_location].push({
          month_year: entry.month_year,
          total_sales: parseFloat(entry.total_sales),
        });
        return acc;
      }, {});

      // Add event listener to update the chart when a new location is selected
      selectElement.addEventListener("change", (event) => {
        updateCharts(event.target.value);
      });

      // Initialize chart with all data
      updateCharts("All");
    });

  // Fetch data for Products Sold by Category
  fetch("products_sold_by_category.json")
    .then((response) => response.json())
    .then((data) => {
      const labels = data.map((entry) => entry.product_category);
      const totalProductsSold = data.map((entry) => entry.total_product_sold);

      const ctx = document
        .getElementById("productsSoldByCategoryChart")
        .getContext("2d");
      productsSoldByCategoryChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Product Sold",
              data: totalProductsSold,
              backgroundColor: "rgba(182, 137, 91, 0.8)",
              borderColor: "rgba(182, 137, 91, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString(); // Format angka pada sumbu Y
                },
              },
            },
          },
        },
      });
    });

  // Fetch data for Sales Trend by Category (Week)
  fetch("sales_trend_by_category_week.json")
    .then((response) => response.json())
    .then((data) => {
      dataByCategoryWeek = data;
      renderSalesTrendByCategoryWeekChart(data); // Memanggil fungsi renderSalesTrendByCategoryWeekChart
    });

  // Add event listener to update the chart when a new location is selected
  selectElement.addEventListener("change", (event) => {
    updateCharts(event.target.value);
  });
}

// Function to update all charts based on selected store location
function updateCharts(location) {
  updateSalesTrendChart(location);
  updateProductSoldByCategoryChart(location);
  updateSalesTrendByCategoryWeekChart(location); // Update Sales Trend by Category Week Chart
}

// Function to update sales trend chart based on selected store location
function updateSalesTrendChart(location) {
  let data;
  if (location === "All") {
    // Merge all location data
    data = Object.values(dataByLocation).flat();
  } else {
    data = dataByLocation[location] || [];
  }

  const groupedData = data.reduce((acc, entry) => {
    if (!acc[entry.month_year]) {
      acc[entry.month_year] = 0;
    }
    acc[entry.month_year] += entry.total_sales;
    return acc;
  }, {});

  const labels = Object.keys(groupedData).sort();
  const totalSales = labels.map((label) => groupedData[label]);

  const ctx = document.getElementById("salesTrendChart").getContext("2d");
  if (salesTrendChart) {
    salesTrendChart.destroy();
  }
  salesTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Sales",
          data: totalSales,
          borderColor: "rgba(182, 137, 91, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString(); // Format numbers on Y-axis
            },
          },
        },
      },
    },
  });
}

// Function to update product sold by category chart based on selected store location
function updateProductSoldByCategoryChart(location) {
  // Fetch data from JSON file
  fetch("products_sold_by_category.json")
    .then((response) => response.json())
    .then((data) => {
      // Filter data based on selected location
      const filteredData =
        location === "All"
          ? data
          : data.filter((entry) => entry.store_location === location);

      // Group data by product category and calculate total product sold for each category
      const totalProductSoldByCategory = filteredData.reduce((acc, entry) => {
        const totalSold = parseInt(entry.total_product_sold); // Convert total_product_sold to number
        if (!isNaN(totalSold)) {
          if (!acc[entry.product_category]) {
            acc[entry.product_category] = 0;
          }
          acc[entry.product_category] += totalSold;
        }
        return acc;
      }, {});

      // Extract labels and data for the chart
      const labels = Object.keys(totalProductSoldByCategory);
      const dataValues = Object.values(totalProductSoldByCategory);

      const ctx = document
        .getElementById("productsSoldByCategoryChart")
        .getContext("2d");
      if (productsSoldByCategoryChart) {
        productsSoldByCategoryChart.destroy();
      }
      productsSoldByCategoryChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Product Sold",
              data: dataValues,
              backgroundColor: "rgba(182, 137, 91, 0.8)",
              borderColor: "rgba(182, 137, 91, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString(); // Format numbers on Y-axis
                },
              },
            },
          },
        },
      });
    });
}

// Function to update sales trend by category week chart based on selected store location
function updateSalesTrendByCategoryWeekChart(location) {
  fetch("sales_trend_by_category_week.json")
    .then((response) => response.json())
    .then((data) => {
      // Filter data based on selected location
      const filteredData =
        location === "All"
          ? data
          : data.filter((entry) => entry.store_location === location);
      renderSalesTrendByCategoryWeekChart(filteredData); // Render chart with filtered data
    });
}

// Function to render sales trend by category (week) chart
function renderSalesTrendByCategoryWeekChart(data) {
  const groupedData = data.reduce((acc, entry) => {
    const key = entry.product_category; // Menggunakan hanya kategori produk sebagai kunci
    if (!acc[key]) {
      acc[key] = {};
    }
    if (!acc[key][entry.year_week]) {
      acc[key][entry.year_week] = 0;
    }
    // Parsing total_sales to ensure it's a number
    const totalSales = parseFloat(entry.total_sales);
    acc[key][entry.year_week] += !isNaN(totalSales) ? totalSales : 0;
    return acc;
  }, {});

  const labels = Array.from(new Set(data.map((entry) => entry.year_week)));

  const datasets = Object.keys(groupedData).map((key, index) => ({
    label: key, // Menggunakan kategori produk sebagai label
    data: labels.map((label) => groupedData[key][label] || 0),
    borderColor: getColor(index),
    borderWidth: 1,
    fill: false,
  }));

  const ctx = document
    .getElementById("salesTrendByCategoryWeekChart")
    .getContext("2d");
  if (salesTrendByCategoryWeekChart) {
    salesTrendByCategoryWeekChart.destroy();
  }
  salesTrendByCategoryWeekChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString(); // Format numbers on Y-axis
            },
          },
        },
      },
    },
  });
}

// Initialize the dashboard
initDashboard();

// Fungsi untuk menampilkan products sold table
$(document).ready(function () {
  $("#productSoldTable").DataTable({
    responsive: true,
    ajax: {
      url: "products_sold_table.json",
      dataSrc: "",
    },
    columns: [
      { data: "store_location" },
      { data: "product_category" },
      { data: "product_detail" },
      { data: "price" },
      { data: "product_sold" },
    ],
  });
});

// Fungsi untuk menampilkan messages
document.addEventListener("DOMContentLoaded", function () {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  const tbody = document.querySelector("#messagesTable tbody");

  function renderMessages() {
    tbody.innerHTML = ""; // Clear existing rows
    messages.forEach((message, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${message.name}</td>
                  <td>${message.email}</td>
                  <td>${message.phone}</td>
                  <td>${message.message}</td>
                  <td><button class="delete-btn" data-index="${index}">Hapus</button></td>
              `;
      tbody.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        messages.splice(index, 1); // Remove the message from the array
        localStorage.setItem("messages", JSON.stringify(messages)); // Update localStorage
        renderMessages(); // Re-render the table
      });
    });
  }

  renderMessages();
});

$(document).ready(function () {
  $("#messagesTable").DataTable({
    responsive: true,
  });
});
