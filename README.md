# GITLine
A synchronization Client from your Outline Collection to your public or private GitHub repository.

## Quickstart

1. Clone the project and 

2. Create a .env file with following content:
```bash
#### OUTLINE ####
OUTLINE_URL=your_outline_instance_url
OUTLINE_API_KEY=the_api_key_you_can_generate_in_the_outline_settings
OUTLINE_COLLECTION_ID=the_outline_id_of_the_collection_you_want_to_sync

#### GITHUB ####
GITHUB_URL=you_github_repository_url_you_created_before
GITHUB_USER=your.user@domain.com
GITHUB_KEY=the_github_key_you_generated_in_github
```
3. Build the app for your architecture with ```docker compose build```

4. Start the instance with ```docker compose up -d``` and enjoy!

5. (Optional: Check what it is doing with ```docker compose logs```)

## What does it actually do?
On first run it creates a timestamp in the main folder of your repo and then syncs the content of the given
Outline Collection into a subfolder called like the collection utilizing the official Outline API.
On further runs, every 5 minutes it will first check if there is actually an update inside the colleciton and also only commit the changes to your repo if there is a change.

## Why?
A Outline collection could be used by you as a Wiki, which is a cool thing. But what if your outline instance or your host or whatever crashes and your documentation to bring it up again is only stored in outline?
That would be a drama, right? 
So in short: with GitLine you have a Backup of your current documentation on GitHub.
