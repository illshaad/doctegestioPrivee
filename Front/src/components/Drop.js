import React from "react";
import { Radio } from "antd";
import AutoComplet from "./AutoComplet.js";
import axios from "axios";
import {
  Card,
  Col,
  Row,
  CardBody,
  CardTitle,
  CardSubtitle,
  Table,
  Container,
} from "reactstrap";
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
      textaeraValue: "",
    };
  }

  onChangeHandler = (e) => {
    this.setState({
      selectedFile: e.target.files,
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
      backArrayFileName: fileName,
    });
  };

  onClickHandler = async () => {
    if (this.state.selectedFile !== null || this.state.textaeraValue !== "") {
      if (this.state.selectedFile && this.state.textaeraValue !== "") {
        let error = [];
        error.push(403);
        error.push(
          "Vous devez choisir entre upload des fichiers ou coller le texte , pas les deux en même temps."
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
            url: `http://localhost:3000/upload?mail=illshaad.budureea@dgmail.fr`,
            data: data,
          }).then((res) => {
            //data du back //
            console.log(res);

            // console.log(res.data[0].resulJson[1], " CEST QUOIIIII");
            timer = Date.now() - tempDebut;
            console.log(timer, "MS");
            var testTableData = [];
            testTableData.push(res.data[0].resulJson[1]);
            this.setState({
              loading: false,
              dataFromBack: res.data[0].resulJson,
              selectedCheckbox: testTableData,
            });
          });
        } else {
          this.setState({ loading: true, message: [] });
          data.append("textarea", this.state.textaeraValue);
          const newUrl = new URL(window.location.href);
          await axios({
            method: "post",
            url: `http://localhost:3000/textarea?mail=illshaad.budureea@dgmail.fr`,
            data: { textarea: this.state.textaeraValue },
          }).then((res) => {
            console.log(res.data);
            var testTableData = [];
            testTableData.push(res.data[1]);
            this.setState({
              loading: false,
              dataFromBack: res.data,
              selectedCheckbox: testTableData,
            });
          });
        }
      }
    } else {
      let returnRsult = [];
      returnRsult.push(404);
      returnRsult.push("Upload un document");
      this.setState({
        message: returnRsult,
      });
    }
  };

  handleChange = (e) => {
    if (e.target.value) {
      const testTab = [];
      testTab.push(this.state.dataFromBack[e.target.value]);
      document.getElementById("formGroupExampleInput").value =
        testTab[0]["diag"];
      this.setState({
        selectedCheckbox: testTab,
        value: e.target.value,
      });
    }
  };

  handleChangeTextaera = (e) => {
    this.setState({
      textaeraValue: e.target.value,
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
            checkModif: false,
          },
        ];
      } else {
        selectedData = [
          {
            diag: document.getElementById("formGroupExampleInput").value,
            score: this.state.selectedCheckbox[0]["scores"],
            checkModif: true,
          },
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
        url: `http://localhost:3000/radio?mail=${newUrl.searchParams.get("mail")}`,
        data: {
          textaeraValue: this.state.textaeraValue,
          data: selectedData,
          file: ArrayBack,
          timer: timer,
          Diags: this.state.dataFromBack,
        },
      }).then((res) => {
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
          message: returnResult,
          textaeraValue: "",
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
              <th size="sm" scope="row">
                {i}
              </th>
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
    let hr = "";
    let message = "";

    if (this.state.dataFromBack[0] !== undefined) {
      buttonNext = (
        <a
          className="alert-link"
          type="button"
          className="btn"
          onClick={this.sendFileBack}
        >
          Cliquez ici pour valider
        </a>
      );

      hr = <hr className="my-2" />;

      champ = <AutoComplet selectedCheckbox={this.state.selectedCheckbox} />;

      tab = (
        <Table size="sm">
          <thead>
            <tr>
              <th scope="row">#</th>
              <th scope="row">Diagnostic</th>
              <th scope="row">Score</th>
              <th scope="row">Validation</th>
            </tr>
          </thead>
          <tbody>{this.drawLine()}</tbody>
        </Table>
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
      <Container fluid={true}>
        <br />
        <br />
        <h1 className="text-center">Bienvenue à DIM-IA</h1>
        <p className="text-center">
          Cet outil vous permet de codifier automatiquement les actes médicaux
          avec la codification CIM-10
        </p>
        <br />
        <br />
        <Row>
          <Col xs="4">
            <div>
              <Card>
                <CardBody>
                  <CardTitle>
                    <h3>
                      <span className="borderadius">1</span> Chargez le dossier
                    </h3>
                  </CardTitle>
                  <CardSubtitle>
                    formats acceptés: docx, pdf, html, png, jpeg, tiff
                  </CardSubtitle>
                  <hr className="my-2" />
                  <form method="post" action="#" id="#">
                    <input
                      id="inputFile"
                      type="file"
                      accept=" .txt , .pdf, .png, .svg, .tiff, .tif .bitmap , .bmp, .html , .htm .jpg, .jpeg , .doc, .docx ,.xml ,application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document , "
                      name="file"
                      multiple
                      onChange={this.onChangeHandler}
                    />
                  </form>
                  <hr className="my-2" />
                  <textarea
                    placeholder="Coller le texte du document ici"
                    onChange={this.handleChangeTextaera}
                  ></textarea>
                  <hr className="my-2" />
                  <a
                    type="button"
                    className="btn"
                    onClick={this.onClickHandler}
                  >
                    Cliquez ici pour ouvrir
                  </a>
                </CardBody>
              </Card>
            </div>
          </Col>
          <br />
          {texteLoading}
          <Col xs="4">
            <div>
              <Card>
                <CardBody>
                  <CardTitle>
                    <h3>
                      <span className="borderadius">2</span> Consultez le
                      résultat
                    </h3>
                  </CardTitle>
                  <CardSubtitle>
                    le tableau des codifications CIM-10 s’affiche ci-dessous.
                  </CardSubtitle>
                  <Col sx="12">
                    {tab}
                    {champ}
                    {hr}
                    {buttonNext}
                  </Col>
                </CardBody>
              </Card>
            </div>
          </Col>
          <Col xs="4">
            <div>
              <Card>
                <CardBody>
                  <CardTitle>
                    <h3>
                      <span className="borderadius">3</span> Donnez votre avis
                    </h3>
                  </CardTitle>
                  <CardSubtitle>
                    Partagez avec nous les problèmes rencontrés
                  </CardSubtitle>
                  <hr className="my-2" />
                  <a href="mailto:romain.farel@dgmail.fr ">
                    Cliquez ici pour nous écrire
                  </a>
                </CardBody>
              </Card>
            </div>
          </Col>
        </Row>
        {message}
        <div>
          <br />
          <NavLink to={home}>
            <button type="button" onClick={this.sendFileBack} className="Exit">
              Terminer
            </button>
          </NavLink>
        </div>
      </Container>
    );
  }
}

export default Upload;
