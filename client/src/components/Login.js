import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            try {
                fetch('/verify-token', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (response.status === 200) {
                            navigate('/');
                        } else {
                            console.log('Verification failed');
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } catch (error) {
                console.log(error);
            }


        }
    }, [])


    async function submit(e) {
        e.preventDefault();

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.status === 200) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                navigate("/");
            } else if (response.status === 401) {
                toast.error('Invalid credentials', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "light",
                });
            } else if (response.status === 404) {
                toast.error('User not found', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "light",
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="container-fluid login">
            <div className="row justify-content-center align-items-center vh-100">
                <div className="col-md-4 bg-light p-4 rounded shadow">
                    <h1 className="mb-4">Login</h1>
                    <form>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control mb-2"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                className="form-control mb-2"
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            onClick={submit}
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link to="/signup">Signup</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;