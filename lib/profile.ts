export async function getProfileImage() {
  try {
    const randomId = Math.floor(Math.random() * 1000)
    const response = await fetch(`https://picsum.photos/id/${randomId}/info`)

    if (!response.ok) {
      throw new Error("Failed to fetch profile image")
    }

    const data = await response.json()
    return {
      id: data.id,
      author: data.author,
      url: data.download_url,
    }
  } catch (error) {
    console.error("Error fetching profile image:", error)
    // Return a default image if fetching fails
    return {
      id: "0",
      author: "Default",
      url: "https://via.placeholder.com/150",
    }
  }
}

