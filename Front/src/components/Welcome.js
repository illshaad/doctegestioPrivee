import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
  }

  onChangeHandler = e =>
    this.setState({
      value: e.target.files
    });

  render() {
    return (
      <div>
        <h1 className="Qui">Hey?</h1>
        <div className="form">
          <form className="login-form">
            <input type="text" placeholder="Email" />
            <input type="password" placeholder="Mots de passe" />
            <button>Connection</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Welcome;
