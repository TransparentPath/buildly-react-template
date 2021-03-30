import React, { useState } from "react";
import { connect } from "react-redux";
import { getDocument } from "pdfjs-dist";
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  makeStyles,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import PdfViewer from "./PDFViewer";
import { uploadBill } from "midgard/redux/shipment/actions/shipment.actions";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  textfield: {
    marginBottom: theme.spacing(2),
  },
  preview: {
    width: theme.spacing(69),
  },
  buttonContainer: {
    margin: theme.spacing(4, 0),
    textAlign: "center",
    justifyContent: "center",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  loadingWrapper: {
    // margin: theme.spacing(1),
    position: "relative",
  },
  submit: {
    borderRadius: "18px",
    fontSize: 11,
  },
}));

const ShipmentKeyInfo = ({
  dispatch,
  shipmentFormData,
  loading,
  viewOnly,
  handleNext,
  handleCancel,
}) => {
  const classes = useStyles();

  const [file, setFile] = useState(null);
  const [text, setText] = useState(null);
  const [key, setKey] = useState('');

  const getPdfText = async (pdf) => {
    let pdfUrl = URL.createObjectURL(pdf);
    let doc = await getDocument(pdfUrl).promise;
    let pageTextPromises = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str.replace(/[^a-zA-Z0-9:;,.?!-() ]/g, '')).join('');
    });
    const pageTexts = await Promise.all(pageTextPromises);
    return pageTexts.join(" ");
  }

  const searchOnBlur = () => {
    var re = new RegExp("(.{0,20})" + key + "(.{0,20})", "gi"), m;
    var lines = [];
    while (m = re.exec(text)) {
      console.log(m);
      var line = (m[1] ? "..." : "") + m[0] + (m[2] ? "..." : "");
      lines.push(line);
    }
    console.log(lines);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let formData = new FormData();
    formData.append('file', file, file.name);
    dispatch(uploadBill(formData));

    console.log("Submit clicked");
  };

  return (
    <Container className={classes.root} maxWidth="sm">
      <form noValidate onSubmit={handleSubmit}>
        <Card variant="outlined">
          <CardContent>
            <TextField
              variant="outlined"
              fullWidth
              type="file"
              id="key-file"
              name="key-file"
              label="Upload file for key"
              className={classes.textfield}
              InputLabelProps={{ shrink: true }}
              onChange={e => {
                setFile(e.target.files[0])
                getPdfText(e.target.files[0])
                  .then((text) => {
                    console.log(text)
                    setText(text)
                  })
                  .catch((error) => console.log(error))
              }}
            />
            <TextField
              variant="outlined"
              required
              fullWidth
              id="file-search"
              name="file-search"
              label="Which should be the key?"
              value={key}
              onChange={e => setKey(e.target.value)}
              onBlur={searchOnBlur}
            />
          </CardContent>
        </Card>
        <Grid className={classes.buttonContainer} container spacing={3}>
          <Grid item xs={6} sm={2}>
            {viewOnly ? (
              <Button
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleCancel}
              >
                Done
              </Button>
            ) : (
              <div className={classes.loadingWrapper}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading || !file}
                >
                  Save
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNext}
              className={classes.submit}
            >
              {`Next: Items`}
            </Button>
          </Grid>
        </Grid>
      </form>
      {file && 
        <PdfViewer
          canvas={classes.preview}
          url={shipmentFormData.uploaded_pdf
            ? shipmentFormData.uploaded_pdf
            : URL.createObjectURL(file)
          }
        />
      }
    </Container>
  )
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state.shipmentReducer,
});

export default connect(mapStateToProps)(ShipmentKeyInfo);
