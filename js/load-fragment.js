function loadHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
}

function loadExternalHTML(filePath, divId) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(divId).innerHTML = data;
            if (window.MathJax) {
                MathJax.typeset();
            }
        })
        .catch(error => {
            console.error('Error loading external HTML:', error);
        });
}

window.onload = function() {
    loadHeader();
    loadExternalHTML('statement.html', 'self-state');
};