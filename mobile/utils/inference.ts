export const returnNotes = async (image: string, userId: string) => {
    const response = await fetch('http://10.108.74.57:5000/api/ar_video_recognition', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image,
            userId
        })
    })

    return response.json();
}