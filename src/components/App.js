import React,{Component} from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import MintingForm from './MintingForm';

class App extends Component { 

  render(){
    return (
      // <BrowserRouter basename={'dognft/Admin'}>
      <BrowserRouter>
          <Switch>
              <Route exact path='/' component={MintingForm} />
          </Switch>
      </BrowserRouter>
    );
  }

}

export default App;