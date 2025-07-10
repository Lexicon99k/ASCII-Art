function showNotificationModal(message) {
    document.getElementById("notificationMessage").innerText = message;
    const modal = document.getElementById("notificationModal");
    modal.style.display = "block";
}

function closeNotificationModal() {
    const modal = document.getElementById("notificationModal");
    modal.style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("notificationModal");
    if (event.target == modal) {
        closeNotificationModal();
    }
}

async function fetchFontNames() {
    try {
        const response = await fetch('https://api.github.com/repos/mskian/ascii-art/contents/fonts');
        if (!response.ok) {
            throw new Error('Failed to fetch fonts');
        }
        const fonts = await response.json();
        return fonts.map(font => font.name.replace('.flf', ''));
    } catch (error) {
        console.error('Error fetching fonts:', error.message);
        return [];
    }
}

async function populateFontDropdown() {
    const fontSelect = document.getElementById('fontSelect');
    const fontList = await fetchFontNames();
    fontList.forEach(font => {
        const option = document.createElement('option');
        option.textContent = font;
        option.value = font;
        fontSelect.appendChild(option);
    });
}

function generateASCII() {
    const inputText = document.getElementById("textInput").value.trim();
    const inputLength = inputText.length;

    if (inputLength < 2) {
        showNotificationModal('Text must be at least 2 characters long.');
        return;
    } else if (inputLength > 40) {
        showNotificationModal('Text must not exceed 40 characters.');
        return;
    }

    const selectedFont = document.getElementById("fontSelect").value;
    const artType = document.getElementById("artType").value;
    const asciiOutput = document.getElementById("asciiOutput");

    asciiOutput.innerText = '';
    asciiOutput.style.display = "block";

    if (artType === 'figlet') {
        figlet(inputText, { font: selectedFont }, function(err, figletData) {
            if (err) {
                console.error('Error generating Figlet ASCII art:', err);
                asciiOutput.innerText = 'Error: Failed to generate ASCII art';
                return;
            }

            if (figletData.trim()) {
                asciiOutput.innerHTML = `<section class="section"><div class="container content"><div class="columns is-centered"><div class="column is-full"><section id="terminal__bar">
            <div class="fakeButtons fakeClose"></div>
            <div class="fakeButtons fakeMinimize"></div>
            <div class="fakeButtons fakeZoom"></div>
            </section><pre>${figletData}</pre>`;
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'has-text-centered';
            asciiOutput.appendChild(buttonContainer);

            const clearButton = document.createElement('button');
            clearButton.innerHTML = '<span class="button-text">Clear</span>';
            clearButton.className = 'button is-danger mr-2';
            clearButton.onclick = clearText;
            buttonContainer.appendChild(clearButton);

            const copyButton = document.createElement('button');
            copyButton.innerHTML = '<span class="button-text">Copy</span>';
            copyButton.className = 'button is-info mr-2';
            copyButton.onclick = copyToClipboard;
            buttonContainer.appendChild(copyButton);

            const saveButton = document.createElement('button');
            saveButton.innerHTML = '<span class="button-text">Save as SVG</span>';
            saveButton.className = 'button is-success';
            saveButton.onclick = () => saveAsSVG(figletData, inputText);
            buttonContainer.appendChild(saveButton);
        });
    } else if (artType === 'cowsay') {
        const cowsayData = `
  __________________
  < ${inputText} >
  ------------------
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
`;
        asciiOutput.innerHTML += `<section class="section"><div class="container content"><div class="columns is-centered"><div class="column is-full"><section id="terminal__bar">
        <div class="fakeButtons fakeClose"></div>
        <div class="fakeButtons fakeMinimize"></div>
        <div class="fakeButtons fakeZoom"></div>
        </section><pre>${cowsayData}</pre>`;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'has-text-centered';
        asciiOutput.appendChild(buttonContainer);

        const clearButton = document.createElement('button');
        clearButton.innerHTML = '<span class="button-text">Clear</span>';
        clearButton.className = 'button is-danger mr-2';
        clearButton.onclick = clearText;
        buttonContainer.appendChild(clearButton);

        const copyButton = document.createElement('button');
        copyButton.innerHTML = '<span class="button-text">Copy</span>';
        copyButton.className = 'button is-info mr-2';
        copyButton.onclick = copyToClipboard;
        buttonContainer.appendChild(copyButton);

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '<span class="button-text">Save as SVG</span>';
        saveButton.className = 'button is-success';
        saveButton.onclick = () => saveAsSVG(cowsayData, inputText);
        buttonContainer.appendChild(saveButton);
    }
}

function clearText() {
    document.getElementById("textInput").value = "";
    document.getElementById("asciiOutput").innerText = "";
    document.getElementById("fontSelect").value = "Standard";
    document.getElementById("asciiOutput").style.display = "none";
}

populateFontDropdown();

async function copyToClipboard() {
    const asciiOutput = document.getElementById("asciiOutput");
    const asciiText = asciiOutput.innerText.replace(/Clear|Copy|Save as SVG/g, '');

    try {
        await navigator.clipboard.writeText(asciiText);
        showNotificationModal('ASCII art copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotificationModal('Failed to copy ASCII art to clipboard');
    }
}

function saveAsSVG(asciiText, originalText) {
    // Clean the ASCII text and split into lines
    const lines = asciiText.trim().split('\n');
    const fontSize = 14;
    const lineHeight = fontSize * 1.2;
    const padding = 20;
    
    // Calculate dimensions
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const charWidth = fontSize * 0.6; // Approximate character width for monospace
    const width = maxLineLength * charWidth + (padding * 2);
    const height = lines.length * lineHeight + (padding * 2);
    
    // Create SVG content
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .ascii-text {
        font-family: 'Courier New', monospace;
        font-size: ${fontSize}px;
        fill: #fdcb6e;
        white-space: pre;
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#2c001e"/>
  
  <!-- ASCII Art Text -->
  <g class="ascii-text">
    ${lines.map((line, index) => 
      `<text x="${padding}" y="${padding + (index + 1) * lineHeight}" xml:space="preserve">${escapeXml(line)}</text>`
    ).join('\n    ')}
  </g>
  
  <!-- Metadata -->
  <metadata>
    <title>ASCII Art: ${escapeXml(originalText)}</title>
    <description>Generated ASCII art from text: ${escapeXml(originalText)}</description>
  </metadata>
</svg>`;

    // Create and download the file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii-art-${originalText.replace(/[^a-zA-Z0-9]/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotificationModal('ASCII art saved as SVG!');
}

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
