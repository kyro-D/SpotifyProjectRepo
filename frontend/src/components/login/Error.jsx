import "./Login.css";

function Error() {
  return (
    <div className="App">
      <div className="spotify-test-div">
        <h4>There was an error while logging in.</h4>
        <p>Please return to homepage and try to login again.</p>
        <a href="/">
          <button>Homepage</button>
        </a>
      </div>
    </div>
  );
}

export default Error;
