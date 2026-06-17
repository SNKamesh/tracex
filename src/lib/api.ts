const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";






type RequestOptions = {

  method?: string;

  body?: unknown;

  token?: string | null;

};










async function request<T>(

endpoint:string,

options:RequestOptions = {}

):Promise<T>{





const headers:HeadersInit = {


"Content-Type":

"application/json",


};






if(options.token){


headers.Authorization =

`Bearer ${options.token}`;


}








const response =

await fetch(

`${API_URL}${endpoint}`,

{

method:

options.method || "GET",


headers,


body:

options.body

?

JSON.stringify(

options.body

)

:

undefined,


}

);









if(!response.ok){



const message =

await response.text();



throw new Error(

message ||

"TraceX server error"

);



}








return response.json();



}









export const api = {





get:<T>(

endpoint:string,

token?:string

)=>


request<T>(

endpoint,

{

token

}

),









post:<T>(

endpoint:string,

body:unknown,

token?:string

)=>


request<T>(

endpoint,

{

method:"POST",

body,

token

}

),









put:<T>(

endpoint:string,

body:unknown,

token?:string

)=>


request<T>(

endpoint,

{

method:"PUT",

body,

token

}

),







delete:<T>(

endpoint:string,

token?:string

)=>


request<T>(

endpoint,

{

method:"DELETE",

token

}

),




};