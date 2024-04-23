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
            copyButton.className = 'button is-info';
            copyButton.onclick = copyToClipboard;
            buttonContainer.appendChild(copyButton);
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
        copyButton.className = 'button is-info';
        copyButton.onclick = copyToClipboard;
        buttonContainer.appendChild(copyButton);
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
    const asciiText = asciiOutput.innerText.replace(/Clear|Copy/g, '');

    try {
        await navigator.clipboard.writeText(asciiText);
        showNotificationModal('ASCII art copied to clipboard!');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotificationModal('Failed to copy ASCII art to clipboard');
    }
}