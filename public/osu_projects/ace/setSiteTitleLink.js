document.addEventListener('DOMContentLoaded', () => {
    var siteTitle = document.querySelector('h1.site-title');
    
    siteTitle.addEventListener('click', () => {
        location.href = "/";
    });
});