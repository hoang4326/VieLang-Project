import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import jwt_decode from "jwt-decode"
import Swal from 'sweetalert2'
import { Button, InputGroup, Form} from 'react-bootstrap'
import withReactContent from 'sweetalert2-react-content'
import {
    Link,
} from "react-router-dom"
import "./lesson.css"


export default function Lesson () {
    // eslint-disable-next-line 
    const param = useParams()
    const [lesson, setLesson] = useState([])
    const [lessonSearch, setLessonSearch] = useState([])
    const [search, setSearch] = useState(null)
    const [showLesson, setShowLesson] = useState(false)
    const [toggled, setToggled] = useState(false)
    const [userId, setUserId] = useState(null)
    const MySwal = withReactContent(Swal)
    const style1 = {}
    const style2 = {}
    let navigate = useNavigate()
    const token = localStorage.getItem('token')

    if(!toggled) {
        style1.display = 'block';
        style2.display = 'none';
    }else{
        
        style1.display = 'none';
        style2.display = 'block';
    }

    const searchVocab = (search)=>{
        let array = [...lesson];
        let array1 = [...lessonSearch];
        let data = lesson[2];
        let data2 = [];
            if(data[0].vocab.some(a => a.vocabVie.toLowerCase().includes(search.toLowerCase())) === true || data[0].vocab.some(a => a.vocabEng.toLowerCase().includes(search.toLowerCase())) === true){
                if(data[0].vocab.some(a => a.vocabVie.toLowerCase().includes(search.toLowerCase())) === true){
                    data2 = [...data2, {vocab: data[0].vocab.filter(function(e) {
                        return e.vocabVie.toLowerCase().indexOf(search.toLowerCase()) !== -1;
                    })}];
                    array1[2] = data2;
                    setLessonSearch(array1)
                }else if (data[0].vocab.some(a => a.vocabEng.toLowerCase().includes(search.toLowerCase())) === true){
                    data2 = [...data2, {vocab: data[0].vocab.filter(function(e) {
                        return e.vocabEng.toLowerCase().indexOf(search.toLowerCase()) !== -1;
                    })}];
                    array1[2] = data2;
                    setLessonSearch(array1)
                }
            }
            else if ((data[0].vocab.find(a => a.vocabVie === search)) === undefined && (data[0].vocab.find(a => a.vocabEng === search)) === undefined){
                setLessonSearch(array)
            }
    }

    const toggleMenu = () =>{
        setToggled(!toggled);
    }

    useEffect(() =>{
        if(token){
            const decoded = jwt_decode(token);
            const userId = decoded._id;
            setUserId(userId);
            setShowLesson(true);
        }else{
            setShowLesson(false);
        }
    },[token])

    const handleClick = () =>{
        MySwal.fire({
            title: <strong>Cannot access !</strong>,
            html: <i>You need to be logged in to be able to take the lesson</i>,
            icon: 'warning'
        }).then(()=>{
            navigate("/login")
        })
    }

    useEffect(() => {
        fetch(`http://localhost:5000/topic/${param.name}`)
        .then(res => 
            res.json()
        )
        .then((data)=>{
            setLesson(data);
            setLessonSearch(data)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [param.name])
    return(
        <div className='mainContent'>
            <div className='unitDetailP'>
                <div className='sidebarAreaLesson'>
                    <div className='unitDetailItemArea'>
                            <div className='tipsArea'>
                                <div className="tipsText"> VOCABULARY </div>
                                <div className="wrap">
                                    <img className='vocabulary' src={require('../../../assets/image/vocabulary.png')} alt='icon'  onClick={toggleMenu}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='switchContent' style={style1}>
                    <div className='compContent'>
                        <div className='unitContent'>
                            <div className="unitName">
                                <Link className='lesson-link' to='/topic'>
                                    <img src={require('../../../assets/image/greyArrow.png')} className="greyArrow" alt='icon'/>
                                </Link>
                                {lesson[3]?.map?.((item,index) =>{
                                    return(
                                    <div key={index}>{item.name}</div>
                                    )
                                })}
                                {/* <div>Basic 1</div> */}
                            </div>
                            <div className='wrapContent'>                             
                                {lesson[1]?.map?.((item,index) =>{
                                    return(
                                        <div className="unitPicArea" key={index}>
                                            <img className='imageLesson' src={item?.lessonImg[0]?.urlImage} alt='icon'/>
                                        </div>
                                        )
                                })}
                                <div className='lessons'>
                                    {lesson[0]?.map?.((item, index)=>{
                                        return (
                                            <div className='lesson lock1' key={index}>
                                                <div className='wrapInner'>
                                                    <div className='iconArea'>
                                                        <img src={require('../../../assets/image/lightIcon.png')} className="flagIcon" alt='icon'/>
                                                        <span className='lessonSortIndex'>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    {showLesson ? (
                                                        <>
                                                            { item.isFinished.find(a => a._id === userId)?
                                                            (
                                                                <Link to = {`${item.id}`} className='lesson-link'>
                                                                <div className='buttonArea'>
                                                                    <div className='btnLesson ripple start'>
                                                                        <div>
                                                                            Review
                                                                        </div>
                                                                        <img src={require('../../../assets/image/review.png')} alt='start'/>
                                                                    </div>
                                                                </div>
                                                                </Link>
                                                            ):
                                                            (
                                                            <Link to = {`${item.id}`} className='lesson-link'>
                                                                <div className='buttonArea'>
                                                                    <div className='btnLesson ripple start'>
                                                                        <div>
                                                                            Start
                                                                        </div>
                                                                        <img src={require('../../../assets/image/start.png')} alt='start'/>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            )
                                                            }
                                                        </>
                                                    ):(
                                                        <button className='lesson-link' onClick={handleClick}>
                                                            <div className='buttonArea'>
                                                                <div className='btnLesson ripple start'>
                                                                    <div>
                                                                        Start
                                                                    </div>
                                                                    <img src={require('../../../assets/image/start.png')} alt='start'/>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )}
                                                    <div className='subDescArea'>
                                                        {item.content1}
                                                        <br/>
                                                        {item.content2}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='switchContent' style={style2}>
                    <div className='switchHead'>
                        <div className='wrapTitle'>
                            <img className='greyArrow' src={require('../../../assets/image/greyArrow.png')} alt='arrow' onClick={toggleMenu}/>
                            <div className='tipsText'>
                                Vocabulary
                            </div>
                            <InputGroup className="mb-3 lesson">
                                <Form.Control
                                    placeholder='Search vocabulary'
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Button variant="outline-secondary" id="button-addon1" className='change' 
                                    onClick={()=>searchVocab(search)}
                                >
                                    Search
                                </Button>
                            </InputGroup>
                        </div>
                    </div>
                    <div className='compContent'>
                        <div className='vacabulary'>
                            <div className='vocabContent'>
                                <div className='vocList'>
                                    {lessonSearch[2]?.map?.((item, index)=>{
                                        return(
                                            <div key={index}>
                                                {item.vocab?.map?.((a,b)=>
                                                    <div className='voc' key={b}>
                                                                <div className='vietnamese'>
                                                                    <div>{a.vocabVie}</div>
                                                                </div>
                                                                <div className='english'>
                                                                    <div>{a.vocabEng}</div>
                                                                </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>            
                    </div>
                </div>
            </div>
        </div>
    )
}