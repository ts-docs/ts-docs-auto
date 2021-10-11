use serde::{Serialize, Deserialize};
use hyper::Client;
use hyper::body;
use hyper_tls::HttpsConnector;
use std::sync::{Arc};
use std::sync::atomic::{AtomicUsize, Ordering};

#[derive(Serialize, Deserialize, Debug)]
pub struct Package<'a> {
    pub id: &'a str,
    pub repository: Option<&'a str>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegistryInfo<'a> {
    #[serde(borrow)]
    pub results: Vec<Package<'a>>,
    pub last_seq: usize
}

pub struct NpmFollower {
    pub current_seq: Arc<AtomicUsize>,
    pub client: Client<HttpsConnector<hyper::client::HttpConnector>>,
}

impl NpmFollower {

    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let https = HttpsConnector::new();
        let client = Client::builder().build::<_, hyper::Body>(https);
        let req = body::to_bytes(client.get("https://replicate.npmjs.com/_changes?since=now".parse()?).await?).await?;

        Result::Ok(NpmFollower{
            client,
            current_seq: Arc::new(AtomicUsize::new(serde_json::from_slice::<RegistryInfo>(&req)?.last_seq))
        })
    }

    pub async fn get<'a>(&mut self, n: u8) -> Result<hyper::body::Bytes, Box<dyn std::error::Error>> {
        let uri = format!("https://replicate.npmjs.com/_changes?since={}&include_docs=true&limit={}", self.current_seq.as_ref().fetch_add(n.into(), Ordering::Relaxed), n).parse()?;
        Result::Ok(body::to_bytes(self.client.get(uri).await?).await?)
    }

    pub fn json<'a>(bytes: &'a hyper::body::Bytes) -> Result<Vec<Package<'a>>, Box<dyn std::error::Error>> {
        Result::Ok(serde_json::from_slice::<RegistryInfo>(&bytes)?.results)
    }

}