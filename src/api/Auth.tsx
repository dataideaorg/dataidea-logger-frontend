import { API_URL } from "./endpoints";
   
   export const getGoogleAuthUrl = async (): Promise<string> => {
    const response = await fetch(API_URL + "/auth/google/login/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (response.ok) {
      const data = await response.json();
      return data.auth_url;
    } else {
      const error = await response.json();
      throw new Error(error.error || "Error getting Google auth URL");
    }
  };
  
  export const googleAuthenticate = async (code: string): Promise<any> => {
    // URL decode the code if it's encoded
    const decodedCode = decodeURIComponent(code);
    
    console.log('Authenticating with Google code:', decodedCode);
    
    const response = await fetch(API_URL + "/auth/google/callback/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: decodedCode }),
    });
  
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      console.error("Google auth error:", error);
      throw new Error(error.detail || "Error authenticating with Google");
    }
  };
