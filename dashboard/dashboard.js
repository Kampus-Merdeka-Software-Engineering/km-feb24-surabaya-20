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

// Ambil data dari file JSON
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
      updateChart(event.target.value);
    });

    // Inisialisasi chart dengan semua data
    updateChart("All");
  });

function updateChart(location) {
  let data;
  if (location === "All") {
    // Gabungkan semua data lokasi
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
              return value.toLocaleString(); // Format angka pada sumbu Y
            },
          },
        },
      },
    },
  });
}

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
    const groupedData = data.reduce((acc, entry) => {
      if (!acc[entry.product_category]) {
        acc[entry.product_category] = {};
      }
      if (!acc[entry.product_category][entry.year_week]) {
        acc[entry.product_category][entry.year_week] = 0;
      }
      acc[entry.product_category][entry.year_week] += entry.total_sales;
      return acc;
    }, {});

    const labels = Array.from(
      new Set(data.map((entry) => entry.year_week))
    ).sort();
    const datasets = Object.keys(groupedData).map((category, index) => ({
      label: category,
      data: labels.map((week) => groupedData[category][week] || 0),
      borderColor: getColor(index),
      borderWidth: 1,
      fill: false,
    }));

    const ctx = document
      .getElementById("salesTrendByCategoryWeekChart")
      .getContext("2d");
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
                return value.toLocaleString(); // Format angka pada sumbu Y
              },
            },
          },
        },
      },
    });
  });

// Fungsi untuk menampilkan products sold table
$(document).ready(function () {
  $("#productSoldTable").DataTable({
    responsive: true,
    ajax: {
      url: "products_sold_table.json",
      dataSrc: "",
    },
    columns: [
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
