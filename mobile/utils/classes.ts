interface addProps {
    userId: string,
    classes: string[]
}
export const addClasses = async ({ userId, classes }: addProps) => {
    // http://10.108.74.57:5000/api/create_user
    await fetch("http://10.108.74.57:5000/api/add_classes", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            classes
        })
    });
}
interface getProps {
    userId: string
}
export const getClasses = async ({userId}: getProps) => {
    const response = await fetch("http://10.108.74.57:5000/api/get_subjects", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
        })
    });
    return response.json();
}