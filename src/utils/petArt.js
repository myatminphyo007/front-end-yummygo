const SEASONS = ["spring", "summer", "autumn", "winter"]

// the plain adult boy. Change this to "/pet/adult-boy.webp" when that picture is ready
export const ADULT_BOY = "/mascot.png"

// where to crop the old season pictures so the face sits in the round thumbnail
const FACE_POS = {
    spring: "50% 16%",
    summer: "50% 10%",
    autumn: "50% 22%",
    winter: "50% 14%",
}

export const adultSrc = (gender) => (gender === "girl" ? "/pet/adult-girl.webp" : ADULT_BOY)

// the season boys are the first pictures you made (/mascots), everything else is in /pet
export const outfitSrc = (key, gender) => {
    const g = gender === "girl" ? "girl" : "boy"
    if (SEASONS.includes(key) && g === "boy") return `/mascots/${key}.webp`
    return `/pet/${key}-${g}.webp`
}

export const thumbPos = (key, gender) =>
    SEASONS.includes(key) && gender !== "girl" ? FACE_POS[key] : "50% 30%"

// the picture that shows the mascot right now
export const artSrc = (pet, withOutfit = true) => {
    if (withOutfit && pet.outfit) return outfitSrc(pet.outfit, pet.gender)
    if (pet.stage === "adult") return adultSrc(pet.gender)
    return `/pet/${pet.stage}.webp`
}
