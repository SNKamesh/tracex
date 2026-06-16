export function sanitizeText(input:string){

    if(!input) return "";
   
    return input
    .replace(/[<>]/g,"")
    .trim();
   
   }
   

   export function isSafeInternalUrl(url:string){
   
    try{
   
    const parsed =
    new URL(
    url,
    window.location.origin
    );
   
   
    return (
    parsed.origin ===
    window.location.origin
    );
   
   
    }
   
    catch{
   
    return false;
   
    }
   
   }
   
   
   
   export function safeRedirect(
    url:string,
    fallback="/"
   ){
   
    if(
    typeof window==="undefined"
    )
    return;
   
   
    if(
    isSafeInternalUrl(url)
    ){
   
    window.location.href=url;
   
    }
   
    else{
   
    console.warn(
    "Blocked unsafe redirect:",
    url
    );
   
    window.location.href=fallback;
   
    }
   
   }