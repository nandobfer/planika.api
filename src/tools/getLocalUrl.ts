export const getLocalUrl = () => {
    if (process.env.DEV) {
        return "http://localhost:4545"
    }
    
    const url = process.env.URL
    return url
}
