
extern crate hyper;
mod follower;
use follower::{NpmFollower, Package};

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut my_follower = NpmFollower::new().await?;
    
    my_follower.queue(10, Box::from(| arr: Vec<Package> | {
        println!("{}", arr.len());
    }));
    Result::Ok(())
}
