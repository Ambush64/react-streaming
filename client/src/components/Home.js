import React, { useEffect, useState, useRef } from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import RecordRTC from 'recordrtc';
import { toast } from "react-toastify";
import Preloader from "./Preloader";

function Home() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [screenStream, setScreenStream] = useState(null);
    const [recorder, setRecorder] = useState(null);
    const userVideo = useRef();
    const partnerVideo = useRef();

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('/verify-token', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.status === 200) {
                    setLoaded(true)
                } else if (response.status === 401) {
                    toast.info('Please Login', {
                        position: "top-right",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "light",
                    });
                    navigate('/login');
                } else {
                    throw new Error('Failed to verify token');
                }
            })
            .catch(error => {
                if (error.response) {
                    navigate('/login');
                } else {
                    console.log("Something went wrong");
                }
                toast.info('Please Login', {
                    position: "top-right",
                    autoClose: 1500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "light",
                });
                console.log(error);
            });

    }, []);



    const startRecording = async () => {
        try {
            const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const combinedStream = new MediaStream([...webcamStream.getTracks(), ...audioStream.getTracks()]);
            userVideo.current.srcObject = combinedStream;

            const screenSharingStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
            partnerVideo.current.srcObject = screenSharingStream;


            const screenRecorder = new RecordRTC(screenSharingStream, { type: 'video' });
            screenRecorder.startRecording();
            setScreenStream(screenRecorder);

            const recorder = new RecordRTC(combinedStream, { type: 'video' });
            recorder.startRecording();
            setRecorder(recorder);

        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (recorder) {
            recorder.stopRecording(() => {
                const recordedBlob = recorder.getBlob();
                localStorage.setItem('recordedVideo', recordedBlob);

                const recordedVideoURL = URL.createObjectURL(recordedBlob);

                userVideo.current.srcObject.getTracks().forEach(track => track.stop());

                userVideo.current.srcObject = null;
                userVideo.current.src = recordedVideoURL;

                setRecorder(null);
            });
        }

        if (screenStream) {
            screenStream.stopRecording(() => {
                const recordedBlob = screenStream.getBlob();
                localStorage.setItem('recordedScreenShare', recordedBlob);

                const recordedVideoURL = URL.createObjectURL(recordedBlob);

                partnerVideo.current.srcObject.getTracks().forEach(track => track.stop());

                partnerVideo.current.srcObject = null;
                partnerVideo.current.src = recordedVideoURL;

                setScreenStream(null);
            });
        }
    };



    return (
        <div className="container-fluid home">
            {loaded ? <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-12 text-center">
                    <button className={`btn btn-primary mx-2 ${recorder ? "" : "dis"}`} onClick={startRecording}>
                        Start Recording
                    </button>
                    <button className={`btn btn-danger mx-2 `} onClick={stopRecording}>
                        Stop Recording
                    </button>
                    <br />
                    <video
                        controls
                        style={{ height: 500, width: 500 }}
                        autoPlay
                        ref={userVideo}
                    />
                    <video
                        controls
                        style={{ height: 500, width: 500 }}
                        autoPlay
                        ref={partnerVideo}
                    />

                </div>
            </div> : <Preloader />}

        </div>
    );
}

export default Home;