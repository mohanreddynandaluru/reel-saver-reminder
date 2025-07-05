// Error handling for module loading
window.addEventListener('error', function(e) {
    console.error('Script error:', e.error);
    if (e.error && e.error.message.includes('import')) {
        console.error('Module import error detected. Make sure all files are properly loaded.');
    }
});

// Additional error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
}); 