
extern crate hyper;
mod follower;
use std::sync::atomic::Ordering;

use follower::NpmFollower;

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut my_follower = NpmFollower::new().await?;
    println!("{}", my_follower.current_seq.as_ref().load(Ordering::Relaxed));
    println!("Sleeping...");
    tokio::time::sleep(std::time::Duration::from_millis(60000)).await;
    println!("{:?}", NpmFollower::json(&my_follower.get(10).await?)?.iter().map(|x| x.id).collect::<Vec<&str>>().join(", "));
    Result::Ok(())
}
