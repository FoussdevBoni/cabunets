export const getServerError = (error: any) => {
    // Axios error
    if (error?.response?.data) {
        return error.response.data.message || error.response.data.error || "Une erreur est survenue";
    }

     if (error?.data) {
        return error.data.message || error.data.error || "Une erreur est survenue";
    }
    
    // Fetch error
    if (error?.message) {
        return error.message;
    }
    
    // Generic error
    if (typeof error === "string") {
        return error;
    }
    
    return "Une erreur inconnue est survenue";
};