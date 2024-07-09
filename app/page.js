"use client";
import { useEffect, useState } from "react";
import { login, sessionExists, fetchPost } from "./server";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const [searchError, setSearchError] = useState("");

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const [userInstaInput, setUserInstaInput] = useState("");
  const [dateInput, setInputDate] = useState("");

  const [posts, setPosts] = useState([]);

  const handleUsernameChange = (event) => {
    setUsernameInput(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPasswordInput(event.target.value);
  };

  const handleUserInstaChange = (event) => {
    setUserInstaInput(event.target.value);
  };

  const handleDateChange = (event) => {
    setInputDate(event.target.value);
  };

  const getPost = async () => {
    const date = new Date(dateInput);
    if (date == "Invalid Date" || date.getFullYear() < 1970) {
      setSearchError("تاریخ غلط است");
    } else {
      setLoading(true);
      setSearchError("");
      const res = await fetchPost(userInstaInput, dateInput);
      if (res === null) {
        setSearchError(
          "خطا! کاربر مورد نظر وجود ندارد یا پستی با این تاریخ پیدا نشد"
        );
      } else {
        setPosts(JSON.parse(res));
      }
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const result = await login(usernameInput, passwordInput);
    if (result[0] == "err login") {
      setError("خطا: اتصال به اینترنت / رمز یا نام کاربری صحیح نیست");
    } else {
      setUsername(usernameInput);
      localStorage.setItem("username", usernameInput);
      setShowLogin(false);
    }
  };

  useEffect(() => {
    const loggedInUsername = localStorage.getItem("username");
    if (loggedInUsername === null) {
      setShowLogin(true);
    }
    sessionExists().then((res) => {
      if (res == true) {
        setShowLogin(false);
        setUsername(loggedInUsername);
      } else {
        setShowLogin(true);
      }
    });
  }, []);

  if (posts.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        {/* {JSON.stringify(posts)} */}
        <button className="p-2 text-white bg-blue-400 rounded-lg" onClick={() => {
          setPosts([])
        }}>
          Return to inputs
        </button>
        {posts.map((post, index) => {
          if (post[1] === "photo") {
            return (
              <div className="flex flex-col justify-center items-center p-4">
                <p className="text-xl font-semibold">Post {index + 1}</p>
                <p>{post[0]}</p>
                <img src={post[2]}></img>
              </div>
            );
          } else if (post[1] === "video") {
            return (
              <div className="flex flex-col justify-center items-center p-4">
                <p className="text-xl font-semibold">Post {index + 1}</p>
                <p>{post[0]}</p>
                <video width="320" height="240" controls>
                  <source src={post[2]} type="video/mp4"></source>
                </video>
                {/* <p>Link if preview does not work:</p> */}
                <a className="text-blue" href={post[2]}>
                  Link if preview does not work:
                </a>
              </div>
            );
          } else {
            return (
              
              <div className="flex flex-col justify-center items-center p-4">
                <p className="text-xl font-semibold">Post {index + 1}</p>
                <p>{post[0]}</p>
                {post[2].map((media, index) => {
                  if (media[0] == "photo") {
                    return <img src={media[1]}></img>;
                  } else {
                    return (
                      <div>
                        <video width="320" height="240" controls>
                          <source src={media[1]} type="video/mp4"></source>
                        </video>
                        {/* ;<p>Link if preview does not work:</p */}
                        <a className="text-blue" href={post[2]}>
                          Link if preview does not work
                        </a>
                        ;
                      </div>
                    );
                  }
                })}
              </div>
            );
          }
        })}
      </div>
    );
  }

  if (showLogin === true) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-8">
        <h1 className="text-3xl font-bold">Login</h1>
        {error !== "" ? (
          <div className="p-4 rounded-lg border border-red-800 bg-red-100 text-red-800">
            <p>{error}</p>
          </div>
        ) : (
          <></>
        )}
        <div className="flex flex-row justify-center items-center gap-4">
          <p>Username: </p>
          <input
            value={usernameInput}
            onChange={handleUsernameChange}
            className="focus:outline-none p-2 border border-blue-400 rounded-lg"
            type="text"
            placeholder="Username"
          ></input>
        </div>
        <div className="flex flex-row justify-center items-center gap-4">
          <p>Password: </p>
          <input
            value={passwordInput}
            onChange={handlePasswordChange}
            className="focus:outline-none p-2 border border-blue-400 rounded-lg"
            type="password"
            placeholder="Password"
          ></input>
        </div>
        <button
          onClick={handleLogin}
          className="p-2 rounded-lg bg-blue-400 text-white"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center gap-6">
      <h1 className="">Logged In as: {username}</h1>
      {searchError !== "" ? (
        <div className="p-4 rounded-lg border border-red-800 bg-red-100 text-red-800">
          <p>{searchError}</p>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-row justify-center items-center gap-4">
        <p>User: </p>
        <input
          value={userInstaInput}
          onChange={handleUserInstaChange}
          className="focus:outline-none p-2 border border-blue-400 rounded-lg"
          type="text"
          placeholder="Instagram Username"
        ></input>
      </div>
      <div className="flex flex-row justify-center items-center gap-4">
        <p>Date: </p>
        <input
          value={dateInput}
          onChange={handleDateChange}
          className="focus:outline-none p-2 border border-blue-400 rounded-lg"
          type="text"
          placeholder="Date"
        ></input>
      </div>

      {loading === false ? (
        <button
          onClick={getPost}
          className="p-2 rounded-lg bg-blue-400 text-white"
        >
          Get Posts
        </button>
      ) : (
        <p
          // onClick={getPost}
          className="p-2 rounded-lg bg-blue-200 border border-blue-800 text-blue-800"
        >
          Loading... (this may take some time)
        </p>
      )}
    </div>
  );
}
