export const checkServer = async () => {
    try {
        const response = await fetch('http://10.108.74.57:5000', {
            method: 'HEAD',
            mode: 'no-cors', 
        });
        return response.ok;
    } catch (error) {
        console.error('Error pinging server:', error);
        return false;
    }
}