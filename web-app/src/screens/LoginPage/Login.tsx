// This file is part of MinIO Console Server
// Copyright (c) 2021 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Loader, RefreshIcon, ApplicationLogo } from "mds";
import { loginStrategyType } from "./login.types";
import MainError from "../Console/Common/MainError/MainError";
import { AppState, useAppDispatch } from "../../store";
import { useSelector } from "react-redux";
import { getFetchConfigurationAsync } from "./loginThunks";
import { resetForm } from "./loginSlice";
import StrategyForm from "./StrategyForm";
import { getLogoApplicationVariant, getLogoVar } from "../../config";
import { RedirectRule } from "api/consoleApi";
import { redirectRules } from "./login.utils";
import { setHelpName } from "../../systemSlice";
import styled from "styled-components";
import get from "lodash/get";

export const getTargetPath = () => {
  let targetPath = "/browser";
  if (
    localStorage.getItem("redirect-path") &&
    localStorage.getItem("redirect-path") !== ""
  ) {
    targetPath = `${localStorage.getItem("redirect-path")}`;
    localStorage.setItem("redirect-path", "");
  }
  return targetPath;
};

// Styled component that always uses dark theme for login page
const CenteredLoginWrapper = styled.div(() => ({
  minHeight: "100vh",
  backgroundColor: "#000110", // Dark theme background
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  position: "relative" as const,
  
  "& .loginCard": {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#283140", // Dark theme card background
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    position: "relative" as const,
    zIndex: 1,
  },
  
  "& .logoSection": {
    padding: "40px 40px 20px 40px",
    textAlign: "center" as const,
    backgroundColor: "#283140", // Dark theme card background
    borderBottom: "1px solid #545D6A", // Dark theme divider
    "& svg": {
      maxWidth: "180px",
      height: "auto",
    },
  },
  
  "& .formSection": {
    padding: "40px",
    backgroundColor: "#283140", // Dark theme card background
    "& .welcomeTitle": {
      fontSize: "28px",
      fontWeight: "700",
      color: "#C4C9D0", // Dark theme font color
      marginBottom: "8px",
      textAlign: "center" as const,
      lineHeight: "1.2",
    },
    "& .welcomeSubtitle": {
      fontSize: "16px",
      color: "#8E98A9", // Dark theme muted text
      marginBottom: "32px",
      textAlign: "center" as const,
      lineHeight: "1.4",
    },
  },
  
  "& .footer": {
    padding: "24px 40px",
    backgroundColor: "#283140", // Dark theme card background
    borderTop: "1px solid #545D6A", // Dark theme divider
    textAlign: "center" as const,
    "& a": {
      color: "#85B3EE", // Dark theme footer elements
      fontSize: "14px",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    "& .separator": {
      color: "#85B3EE", // Dark theme footer elements
      marginLeft: "8px",
      marginRight: "8px",
    },
  },
  
  "& .errorContainer": {
    textAlign: "center" as const,
    padding: "20px",
    "& .loadingLoginStrategy": {
      textAlign: "center" as const,
      width: 40,
      height: 40,
      margin: "0 auto 16px auto",
    },
    "& .buttonRetry": {
      display: "flex",
      justifyContent: "center",
      marginTop: "24px",
    },
    "& .errorTitle": {
      color: "#FF3958", // Dark theme danger color
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "8px",
    },
    "& .errorMessage": {
      color: "#8E98A9", // Dark theme muted text
      fontSize: "14px",
      lineHeight: "1.4",
      marginBottom: "24px",
    },
  },
}));

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loginStrategy = useSelector(
    (state: AppState) => state.login.loginStrategy,
  );
  const loadingFetchConfiguration = useSelector(
    (state: AppState) => state.login.loadingFetchConfiguration,
  );
  const navigateTo = useSelector((state: AppState) => state.login.navigateTo);

  useEffect(() => {
    if (navigateTo !== "") {
      dispatch(resetForm());
      navigate(navigateTo);
    }
  }, [navigateTo, dispatch, navigate]);

  useEffect(() => {
    if (loadingFetchConfiguration) {
      dispatch(getFetchConfigurationAsync());
    }
  }, [loadingFetchConfiguration, dispatch]);

  let loginComponent;

  switch (loginStrategy.loginStrategy) {
    case loginStrategyType.redirect:
    case loginStrategyType.form: {
      let redirectItems: RedirectRule[] = [];

      if (
        loginStrategy.redirectRules &&
        loginStrategy.redirectRules.length > 0
      ) {
        redirectItems = [...loginStrategy.redirectRules].sort(redirectRules);
      }

      loginComponent = <StrategyForm redirectRules={redirectItems} />;
      break;
    }
    default:
      loginComponent = (
        <div className="errorContainer">
          {loadingFetchConfiguration ? (
            <Fragment>
              <Loader className={"loadingLoginStrategy"} />
              <p style={{ margin: 0 }}>Connecting to server...</p>
            </Fragment>
          ) : (
            <Fragment>
              <div className="errorTitle">Connection Error</div>
              <div className="errorMessage">
                An error has occurred
                <br />
                The backend cannot be reached.
              </div>
              <div className={"buttonRetry"}>
                <Button
                  onClick={() => {
                    dispatch(getFetchConfigurationAsync());
                  }}
                  icon={<RefreshIcon />}
                  iconLocation={"end"}
                  variant="regular"
                  id="retry"
                  label={"Retry"}
                />
              </div>
            </Fragment>
          )}
        </div>
      );
  }

  useEffect(() => {
    dispatch(setHelpName("login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <MainError />
      <CenteredLoginWrapper>
        <div className="loginCard">
          {/* Logo Section */}
          <div className="logoSection">
            <ApplicationLogo
              applicationName={getLogoApplicationVariant()}
              subVariant={getLogoVar()}
            />
          </div>

          {/* Form Section */}
          <div className="formSection">
            <h1 className="welcomeTitle">Welcome back!</h1>
            <p className="welcomeSubtitle">Sign in to access your object storage console</p>
            {loginComponent}
          </div>

          
        </div>
      </CenteredLoginWrapper>
    </Fragment>
  );
};

export default Login;
