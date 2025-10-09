import { createContext, useEffect, useState } from "react";

const IsMobileContext = createContext()

export default IsMobileContext

export const IsMobileProvider = ({children}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1100)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1100)
        window.addEventListener('resize', handleResize)
        return(() => {
            window.removeEventListener("resize", handleResize)
        })
    }, [])

    const context = {
        isMobile
    }
    return (
        <IsMobileContext.Provider value={context}>
            {children}
        </IsMobileContext.Provider>
    )
}