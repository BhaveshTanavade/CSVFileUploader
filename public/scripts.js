document.getElementById('uploadButton').addEventListener('click', uploadFile);

async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (file && file.type === 'text/csv') {
    const formData = new FormData();
    formData.append('csvFile', file);

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('File uploaded successfully');
      listFiles();
    } else {
      alert('Failed to upload file');
    }
  } else {
    alert('Please select a valid CSV file');
  }
}

async function listFiles() {
  const response = await fetch('/files');
  console.log(response);
  const files = await response.json();
  console.log(files);
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';

  files.forEach(file => {
    const listItem = document.createElement('li');
    listItem.textContent = file;
    listItem.addEventListener('click', () => displayFile(file));
    fileList.appendChild(listItem);
  });
}

async function displayFile(filename) {
  const response = await fetch(`/file/${filename}`);
  const data = await response.json();
  const tableContainer = document.getElementById('tableContainer');

  if (data.length > 0) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.addEventListener('click', () => sortTable(table, header));
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    createSearchBox(headers, data);
  } else {
    tableContainer.innerHTML = 'No data available';
  }
}

function sortTable(table, header) {
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const columnIndex = Array.from(table.querySelectorAll('th')).findIndex(th => th.textContent === header);
  const sortedRows = rows.sort((a, b) => {
    const aText = a.children[columnIndex].textContent;
    const bText = b.children[columnIndex].textContent;
    return aText.localeCompare(bText);
  });

  const tbody = table.querySelector('tbody');
  sortedRows.forEach(row => tbody.appendChild(row));
}

function createSearchBox(headers, data) {
  const tableContainer = document.getElementById('tableContainer');
  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search...';
  searchBox.addEventListener('input', () => filterTable(headers, data, searchBox.value));
  tableContainer.insertBefore(searchBox, tableContainer.firstChild);
}

function filterTable(headers, data, query) {
  const tableContainer = document.getElementById('tableContainer');
  const table = tableContainer.querySelector('table');
  const tbody = table.querySelector('tbody');

  const filteredData = data.filter(row => {
    return headers.some(header => row[header].toString().toLowerCase().includes(query.toLowerCase()));
  });

  tbody.innerHTML = '';
  filteredData.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

listFiles();
