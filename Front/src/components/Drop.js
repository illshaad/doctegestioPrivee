import React from "react";
import { Radio } from "antd";
import axios from "axios";
import { NavLink } from "react-router-dom";

let timer = 0;

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null, //mon fichier est stoker ici//
      dataFromBack: [],
      selectedCheckbox: [],
      value: 1,
      message: [],
      loading: false,
      backArrayFileName: [],
      textaeraValue: ""
    };
  }

  onChangeHandler = e => {
    this.setState({
      selectedFile: e.target.files
    });

    let fileName = [];
    console.log("e.target.files", e.target.files);
    for (let i in e.target.files) {
      if (Object.values(e.target.files)[i]) {
        fileName.push(Object.values(e.target.files)[i].name);
      }
    }
    console.log("FILENAME", fileName);
    this.setState({
      backArrayFileName: fileName
    });
  };

  onClickHandler = async () => {
    if (this.state.selectedFile !== null || this.state.textaeraValue !== "") {
      if (this.state.selectedFile && this.state.textaeraValue !== "") {
        let error = [];
        error.push(403);
        error.push(
          "Vous devez choisir entre upload des fichiers ou chercher par mots clés, pas les deux en même temps."
        );
        this.setState({ message: error });
      } else {
        let data = new FormData();
        if (this.state.selectedFile) {
          for (var i = 0; i < this.state.selectedFile.length; i++) {
            data.append("file", this.state.selectedFile[i]); //envoie data back //
          }
          console.log(data);
          this.setState({ loading: true, message: [] });
          let tempDebut = Date.now();
          const newUrl = new URL(window.location.href);
          await axios({
            method: "post",
            url: `http://localhost:3001/upload?mail=${newUrl.searchParams.get(
              "mail"
            )}`,
            data: data
          }).then(res => {
            //data du back //
            console.log(res.data[0].resulJson[1]);
            timer = Date.now() - tempDebut;
            console.log(timer, "MS");
            var testTableData = [];
            testTableData.push(res.data[0].resulJson[1]);
            this.setState({
              loading: false,
              dataFromBack: res.data[0].resulJson,
              selectedCheckbox: testTableData
            });
          });
        } else {
          this.setState({ loading: true, message: [] });
          data.append("textarea", this.state.textaeraValue);
          const newUrl = new URL(window.location.href);
          await axios({
            method: "post",
            url: `http://localhost:3001/textarea?mail=${newUrl.searchParams.get(
              "mail"
            )}`,
            data: { textarea: this.state.textaeraValue }
          }).then(res => {
            console.log(res.data);
            var testTableData = [];
            testTableData.push(res.data[1]);
            this.setState({
              loading: false,
              dataFromBack: res.data,
              selectedCheckbox: testTableData
            });
          });
        }
      }
    } else {
      let returnRsult = [];
      returnRsult.push(404);
      returnRsult.push("Upload un document");
      this.setState({
        message: returnRsult
      });
    }
  };

  handleChange = e => {
    if (e.target.value) {
      const testTab = [];
      testTab.push(this.state.dataFromBack[e.target.value]);
      document.getElementById("formGroupExampleInput").value =
        testTab[0]["diag"];
      this.setState({
        selectedCheckbox: testTab,
        value: e.target.value
      });
    }
  };

  handleChangeTextaera = e => {
    this.setState({
      textaeraValue: e.target.value
    });
  };

  sendFileBack = async () => {
    document.getElementById("inputFile").value = null;
    if (document.getElementById("formGroupExampleInput") !== null) {
      let ArrayBack = this.state.backArrayFileName;
      let selectedData = [];

      if (document.getElementById("formGroupExampleInput").value === "") {
        selectedData = [
          {
            diag: this.state.selectedCheckbox[0]["diag"],
            scores: this.state.selectedCheckbox[0]["scores"],
            checkModif: false
          }
        ];
      } else {
        selectedData = [
          {
            diag: document.getElementById("formGroupExampleInput").value,
            score: this.state.selectedCheckbox[0]["scores"],
            checkModif: true
          }
        ];
      }
      const newUrl = new URL(window.location.href);
      const data = new FormData();
      data.append("radiogroup", this.state.selectedCheckbox);
      if (newUrl.searchParams.get === "") {
        return alert("non connecté");
      } //recuperer la donnée de fromback et la checkbok l'indice de validation
      await axios({
        //Extraire url email //
        method: "post",
        url: `http://localhost:3001/radio?mail=${newUrl.searchParams.get(
          "mail"
        )}`,
        data: {
          data: selectedData,
          file: ArrayBack,
          timer: timer,
          Diags: this.state.dataFromBack
        }
      }).then(res => {
        let returnResult = [];
        returnResult.push(res.status);
        if (res.status === 200) {
          returnResult.push("Fichier envoyé");
        } else {
          returnResult.push("error type : " + res.status);
        }
        this.setState({
          selectedFile: null,
          dataFromBack: [],
          selectedCheckbox: [],
          value: 1,
          message: returnResult
        });
      });
    }
  };

  drawLine = () => {
    let result = [];
    if (this.state.dataFromBack) {
      this.state.dataFromBack.map((row, i) => {
        if (i > 0) {
          result.push(
            <tr key={i}>
              <th scope="row">{i}</th>
              <th>{row["diag"]}</th>
              <th>{row["scores"]} % </th>
              <th>
                <Radio.Group name="radiogroup" value={this.state.value}>
                  <Radio onChange={this.handleChange} value={i}></Radio>
                </Radio.Group>
              </th>
            </tr>
          );
        }
      });
    }
    return result;
  };

  render() {
    var Test = "";
    if (this.state.selectedCheckbox[0]) {
      Test = this.state.selectedCheckbox[0]["diag"];
    }
    let buttonNext = "";
    let champ = "";
    let tab = "";
    let message = "";

    if (this.state.dataFromBack[0] !== undefined) {
      buttonNext = (
        <button className="button-next" onClick={this.sendFileBack}>
          Valider et continuer
        </button>
      );
      champ = (
        <form>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="formGroupExampleInput"
              placeholder={Test}
            />
          </div>
        </form>
      );
      tab = (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Diagnostic</th>
              <th scope="col">Score</th>
              <th scope="col">Validation</th>
            </tr>
          </thead>
          <tbody>{this.drawLine()}</tbody>
        </table>
      );
    }

    if (this.state.message[0] !== undefined) {
      if (this.state.message[0] === 200) {
        message = (
          <div className="alert alert-success" role="alert">
            {this.state.message[1]}
          </div>
        );
      } else {
        message = (
          <div className="alert alert-danger" role="alert">
            {this.state.message[1]}
          </div>
        );
      }
    }
    const loading = this.state.loading;
    if (loading) {
      var texteLoading = <img src="./loading.svg" />;
    }
    const newUrl = new URL(window.location.href);
    const home = "/home" + `?mail=${newUrl.searchParams.get("mail")}`;

    return (
      <div className="container">
        <div className="logo"></div>
        <div className="d-flex align-items-center bd-highlight">
          <div>
            <div className="text">1</div>
          </div>
          <div>
            <h1>Chargez le dossier</h1>
            <br />
            formats acceptés: docx, pdf, html, png, jpeg, tiff
          </div>
          <div>
            <form method="post" action="#" id="#">
              <div className="form-group files">
                <input
                  id="inputFile"
                  type="file"
                  accept=" .txt , .pdf, .png, .svg, .tiff, .tif .bitmap , .bmp, .html , .htm .jpg, .jpeg , .doc, .docx ,.xml ,application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document , "
                  name="file"
                  multiple
                  onChange={this.onChangeHandler}
                />
                <textarea
                  placeholder="Chercher par mots clés"
                  onChange={this.handleChangeTextaera}
                ></textarea>
              </div>
            </form>
            <button type="button" className="btn" onClick={this.onClickHandler}>
              Upload
            </button>
          </div>
        </div>
        <br />
        {texteLoading}
        <div className="d-flex align-items-center bd-highlight">
          <div>
            <div className="text">2</div>
          </div>
          <div>
            <h1>Consultez le résultat</h1>
            <br />
            le tableau des codifications CIM-10
          </div>
          <div>{tab}</div>
        </div>
        <div className="d-flex align-items-center bd-highlight">
          <div>
            <div className="text">3</div>
          </div>
          <div>
            <h1>Validez ou corrigez</h1>
            <br />
            Si le résultat de l'algorithme ne convient pas,
            <br />
            veuillez corriger le code dans la case en face{" "}
          </div>
          <div>{champ}</div>
        </div>
        {message}

        <div className="d-flex justify-content-center">
          <NavLink to={home}>
            <button type="button" onClick={this.sendFileBack} className="Exit">
              Terminer
            </button>
          </NavLink>
          {buttonNext}
        </div>
      </div>
    );
  }
}

export default Upload;
