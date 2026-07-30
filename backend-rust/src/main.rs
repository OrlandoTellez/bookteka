use axum::{Router, routing::get};
use tokio::net::TcpListener;

const PORT: u16 = 4000;
const HOST: &str = "0.0.0.0";

#[tokio::main]
async fn main() {
    let route: Router = Router::new().route("/", get(|| async { "hola mundo" }));

    let addr: String = format!("{}:{}", &HOST, &PORT);

    let listener: TcpListener = TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| panic!("error {}", e));

    println!("Server on http://{}:{}", &HOST, PORT);

    axum::serve(listener, route)
        .await
        .unwrap_or_else(|e| panic!("Error {}", e))
}
