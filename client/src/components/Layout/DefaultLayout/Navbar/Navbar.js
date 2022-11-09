import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";

// import { MenuItems }   from "./Menu";
import {
    // Routes,
    // Route,
    Link,
} from "react-router-dom";

import './navbar.css';

export default function Navbar() {
    const [userData, setUserData] = useState("");
    const [clicked, setClicked] = useState(false);
    const [toggled, setToggled] = useState(false);
    const token = localStorage.getItem('token');

    var style1 = {};
    var style2 = {};
    var style3 = {};

    if(!token) {
        style1.display = 'none';
        style3.display = 'none';
    }else{
        style2.display = 'none';
        const decoded = jwt_decode(token);
        const role = decoded.role;
        if(role === "customer"){
            style3.display = 'none';
        }
    }

    const toggleMenu = () =>{
        setToggled(!toggled);
    }

    const logOut = () =>{
        localStorage.removeItem('token');
        style1.display = 'none';
    }
    const handleClick = () =>{
        setClicked(!clicked);
    }

    const isExpired = (token) => {        
        const decode = JSON.parse(atob(token?.split('.')[1]));
        if (decode.exp * 1000 < new Date().getTime()) {
            localStorage.clear();
            console.log('Time Expired');
            window.location.href = "./login";
        }
    };

    useEffect(() =>{
        if(token){
            isExpired(token);
        }
    },[token])

    useEffect(() => {
        if(token){
            fetch("http://localhost:5000/userData",{
            method: "POST",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin":"*",
            },
            body: JSON.stringify({
                token:window.localStorage.getItem("token"),
            }),
        })
        .then((res)=> res.json())
        .then((data)=>{
            setUserData(data.data);
        });
        }
    },[token]);

    return (
            <div className='Navigation'>
                <nav className='navbarItems'>
                    <Link to='/' className='lesson-link'><h1 className='navbar-logo'> VIELANG</h1></Link>
                    <div className='menu-icon' onClick={handleClick}>
                            <i className={clicked ? 'fas fa-times': 'fa fa-bars'}></i>
                    </div>
                    <ul className={clicked ? 'nav-menu active' : 'nav-menu'}>
                        {/* {MenuItems.map((item,index)=>{
                            return (
                                <li key = {index}>
                                    <Link className={item.cName} to={item.url}>
                                        {item.title}
                                    </Link>
                                </li>
                            )
                        })} */}
                        <li>
                            <Link className='nav-links' to='/'>
                                HOME
                            </Link>
                        </li>
                        <li>
                            <Link className='nav-links' to='/topic'>
                                LESSONS
                            </Link>
                        </li>
                        <li>
                            <Link className='nav-links' to='/admin/user' style={style3}>
                                MANAGE
                            </Link>
                        </li>
                        <li>
                            <Link className='nav-links' to='/support'>
                                CONTACT
                            </Link>
                        </li>
                        <li>
                            <Link className='nav-links' to='/login' style={style2}>
                                SIGN IN
                            </Link>
                        </li>
                    </ul>
                    <img src={require('../../../../assets/image/user.png')} className='user-pic' alt='profile' onClick={toggleMenu} style={style1}/>
                    <div className={ toggled ? 'sub-menu-wrap open-menu' : 'sub-menu-wrap' } style={style1} >
                    {/* <div className='sub-menu-wrap' style={style1} id='subMenu' ref={ref}> */}
                        <div className='sub-menu'>
                            <div className='user-info'>
                                <img src={require('../../../../assets/image/user.png')}  alt='profile' />
                                <h2>{userData.name}</h2>
                            </div>
                            <hr/>

                            <Link to={`/achievement/${userData._id}`} className='sub-menu-link'>
                                <img src={require('../../../../assets/image/profile.png')} alt='profile' />
                                <p className='profileNav'>Profile</p>
                                {/* <span>{'>'}</span> */}
                            </Link>
                            <Link to='/#' className='sub-menu-link' onClick={logOut}>
                                <img src={require('../../../../assets/image/logout.png')} alt='profile' />
                                <p className='profileNav'>Logout</p>
                                {/* <span>{'>'}</span> */}
                            </Link>

                        </div>
                    </div>
                </nav>
            </div>

        )
}

