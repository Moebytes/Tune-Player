import React from "react"
import logo from "../assets/icons/logo.gif"
import hibiki from "../assets/images/hibiki-chibi.png"
import "./styles/logobar.less"

const LogoBar: React.FunctionComponent = (props) => {
    return (
        <header className="header">
            <section className="header-container" onClick={() => window.location.href = "/"}>
                <img src={logo} className="header-img"/>
                <h1 className="header-text">Tune Player</h1>
                {/*<img src={hibiki} className="hibiki-img"/>*/}
                <div className="logo-bar-drag"></div>
            </section>
        </header>
    )
}

export default LogoBar