function AddImplementController($rootScope, $scope, $http, FarmerService, fileUpload, OTPService) {

    let isNorthEast = false;
    $scope.newYear = [];
    let CurrentFinYear = "0";
    $scope.ApplyNew = undefined;
    $scope.classValue = "Instruct";
    // let Timeline = {}; let PermitGeneration = false;
    //Urls

    let waitHtml = '<i class="fa fa-spinner fa-spin"></i> Please Wait....';
    let MbaseUrl = "../Management/";
    let ApplicationBase = "../Application/";
    let Applica = "../Registration/";

    let URLS = {
        Applications: ApplicationBase + "FarmerCurrentApplications",
        Add: MbaseUrl + "AddImplementToApplication",
        AddApplicationWithStateScheme: MbaseUrl + "AddImplementToApplicationWithStateScheme",
        Implements: MbaseUrl + "AllImplementsForState",
        AllImplements: MbaseUrl + "GetAllImplementsForScrutinyApplication",
        
        HasValidDocuments: ApplicationBase + "HasValidDocuments",
        Dealers: ApplicationBase + "Dealers",
        Target: ApplicationBase + "RemaingTargetForFarmer",
        AddDealer: ApplicationBase + "AddDealer",
        ShowDealer: ApplicationBase + "ShowDealerDetails",
        GetAllMakeModels: ApplicationBase + "GetAllMakeModels",
        WithdrowApplicaion: Applica + "WithdrawApplication",
        Schemes: ApplicationBase + "SchemesForImplement",
        Components: ApplicationBase + "ComponentForImplement",
        ISSchemeHasFile: MbaseUrl + "ISSchemeHasFile",
        LandLocations: ApplicationBase + "LandLocation",
        DealersCheck: ApplicationBase + "CheckDealers",
        GetImplements: ApplicationBase + "GetImplements",
        Update: ApplicationBase + "Update",
        GetTimeline: ApplicationBase + "GetTimelineForFarmerApplication"
    };
  

    let getImplements = function () {
        $scope.StateImplements = {};
        $http({ method: "POST", url: URLS.Implements, params: { LocationID: $scope.Implements.LocationID, FinYear: $scope.Man.FinYear } }).then(function (R) {
            $scope.StateImplements = R.data;
            $scope.Implements.ImplementSubsidyID = "0";
        });
    }

    let getAllImplements = function () {
        $scope.StateImplements = {};
        $http({ method: "POST", url: URLS.AllImplements}).then(function (R) {
            $scope.StateImplements = R.data;
            $scope.Implements.ImplementSubsidyID = "0";
        });
    }

    let convertToURL = function (Text) {
        return Text
            .toLowerCase()
            .replace(/ /g, '%20')
            //.replace(/[^\w-]+/g, '')
            ;
    }

    let IsBlank = function (F) {
        if (F != undefined) { F = F.toString(); }
        if (F === undefined || F == "0") {
            return true;
        }
        else return false;
    };

    $scope.GetAddresses = function (dlr) {
        FarmMachineryObj.BlockPage();

        let URLSS = convertToURL("http://maps.googleapis.com/maps/api/geocode/xml?address=" + dlr.FirmAddress + "&sensor=false")

        $.ajax({
            type: 'POST',
            // contentType: 'application/json; charset=utf-8',
            url: URLSS,
            headers: {
                Accept: "application/json; charset=utf-8",
                //"Content-Type": "application/json; charset=utf-8"
            },
            // data: "{'GroupCode':'" + $scope.CropGroup + "'}",
            success: function (Result) {
                let jsond = xml2json(Result);

                $scope.LocatoinDetails = JSON.parse(jsond.replace("undefined", ""));

                let latLong = $scope.LocatoinDetails.GeocodeResponse.result.geometry.location;

                let urld = "https://www.mapsdirections.info/en/custom-google-maps/map.php?width=100%&height=600&hl=ru&coord=" + latLong.lat + "," + latLong.lng + "&output=embed"

                FarmMachineryObj.ShowMessage($scope.LocatoinDetails.GeocodeResponse.result.formatted_address, '<iframe height="470px" width="100%" frameborder="0" scrolling="no" src="' + urld + '" allowfullscreen=""></iframe>');


                FarmMachineryObj.ShowPage();
            }, error: function () {
                alert('Error in fatching data. Please Try Again.');
                FarmMachineryObj.ShowPage();
            }

        });



    }

    $scope.ApplyNewApp = function () {
        $scope.ApplyNew = true;
        $scope.classValue = "ApplyNewApp"
        $scope.Implements.ImplementSubsidyID = "0";

    }

    $scope.SendBAckApplication = function () {
        if ($scope.Man.FinYear > 0) {

            $http({ method: 'POST', url: '../../Master/Management/New_ApplicationVerification', params: { Year: $scope.Man.FinYear, ApplicationType: '108' } }).then(function (Response) {
                $scope.FarmerImplementList = Response.data;
            });

        } else {
            alert("Select Financial Year");
        }
    }

    $scope.WithdrownApplicaions = function () {
        $scope.classValue = "WithdrownApplicaions";
        if ($scope.Man.FinYear > 0) {
            $scope.ApplyNew = false;
            FarmerService.FarmerLandDetails(function (Land) {
                $scope.FarmerLandDetails = Land;
            });
            $scope.Header = "Applications Withdrown By You";
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus.trim() == "14" });

        } else {
            alert("Select Financial Year");
        }
    }

    $scope.CompletedApplications = function () {
        $scope.classValue = "CompletedApplications";
        if ($scope.Man.FinYear > 0) {
            $scope.ApplyNew = false;
            $scope.DealerList = {};
            $scope.Header = "Complete Applications (Subsidy Released)";
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus.trim() == "7" });
        } else {
            alert("Select Financial Year");
        }
    }

    $scope.OnInstruction = function () {
        $scope.classValue = "Instruct";
        $scope.ApplyNew = false;
        $scope.DealerList = {};
        $scope.Header = "Instruction to Apply Application";
    }

    $scope.RejectedApplications = function () {
        $scope.classValue = "RejectedApplications";
        if ($scope.Man.FinYear > 0) {
            $scope.ApplyNew = false;
            $scope.DealerList = {};
            $scope.Header = "Rejected Applications";
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus.trim() == "12" });
        } else {
            alert("Select Financial Year");
        }
    }

    $scope.AllNewApplications = function () {
        $scope.classValue = "AllNewApplications";
        if ($scope.Man.FinYear > 0) {
            $scope.ApplyNew = false;

            $scope.DealerList = {};
            $scope.Header = "All New & In-Process Applications";
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus.trim() != "12" && permit.ApplicationStatus.trim() != "14" && permit.ApplicationStatus.trim() != "7" });
        } else {
            alert("Select Financial Year");
        }
    }

    $scope.ImplementsToUpdate == "0";

    $scope.UpdateImplement = function (Application) {
        $scope.ApplicationToUpdate = Application;

        $http({ method: 'POST', url: URLS.GetImplements, params: { ApplicationRefNo: Application.Application, ImplementSubsidyID: Application.ImplementSubsidyID } }).then(function (R) {
            $("#UpdateApplication").modal();
            // $scope.ApplicationToUpdate = Application;
            $scope.ImplementsToUpdate = R.data;
        });

    }

    $scope.OnForwardAgain = function (Application) {

        $http({ method: "post", url: "../../Master/Management/ApplicationReForwardedByFarmerForBasicDetailVerification", params: { ApplicationRefno: Application.Application } }).then(function (Response) {

            FarmMachineryObj.ShowPage();
            alert("Application Details Approved. Application ReForwarded By Farmer For BasicDetailVerification.");

            $('#btnForWord').hide();

        });

    }

    $scope.UpdateApplication = function () {


        var AppDetails = $scope.ApplicationToUpdate;


        $http({ method: 'POST', url: URLS.Update, params: { ApplicationRefNo: AppDetails.Application, ImplementSubsidyID: $scope.UpdateApplication.ImplementSubsidyID } }).then(function (R) {
            FarmMachineryObj.ShowPage();
            if (angular.isArray(R.data)) {
                $scope.Header = "All New & In-Process Applications";
                $scope.AllApplications = R.data;
                $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 9 && permit.ApplicationStatus != 7 });

                $("#RegButton").hide();
                $("#TermsAndConditions").hide();
                $scope.Implements.FinYear = CurrentFinYear;
                $scope.Implements.ImplementSubsidyID = "0";

            }
            else {
                $(".ErrorMessage").html(R.data);
            }


        });

    }

    $scope.HasFile = false;

    $scope.ISSchemeHasFile = function () {
        $(".ErrorMessage").html(waitHtml);
        $scope.SchemeHasFile($scope.Implements.SchemeID);
        var Scheme = $scope.Implements.SchemeID;
        if ($scope.Implements.SchemeID == 29) {

            $('#GSTInfo').modal("show");
        }
        var comp = $scope.Implements.SchemeID == 1 ? 1 : 0;
        $http({ method: 'POST', url: URLS.Target, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, Year: $scope.Man.FinYear, Scheme: Scheme, component: comp, LandID: $scope.Implements.LocationID } }).then(function (R) {
            $scope.RemainingTG = parseInt(R.data);
            if ($scope.RemainingTG > 0) {

                $http({ method: "POST", url: URLS.DealersCheck, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, LandID: $scope.Implements.LocationID, Year: $scope.Man.FinYear } }).then(function (R) {
                    FarmMachineryObj.ShowPage();

                    var Dlrs = R.data;
                    var msg = (Dlrs <= 0 ? ", But no dealer available for this Implement, You can add the application but it will wait for the dealer." : ", Dealers : " + Dlrs);
                    $(".ErrorMessage").html("Available Target : " + $scope.RemainingTG + msg);

                });
            }
            else if ($scope.RemainingTG == 0) {
                $(".ErrorMessage").html("Presently no target is available for this implement, Your application will go to the wailting list.");
            }
        });
    }

    $scope.SchemeHasFile = function (SchemeID) {
        $http({ method: "POST", url: URLS.ISSchemeHasFile, params: { SchemeID: SchemeID } }).then(function (R) {
            $scope.HasFile = R.data;
        });
    }

    let withdrawAoolicationAfterVerification = function (A) {

        $scope.DealerList = {};
        FarmMachineryObj.BlockPage();
        $http({ method: "POST", url: URLS.WithdrowApplicaion, params: { ApplicationRefNo: A.Application, FinYear: $scope.Man.FinYear } }).then(function (R) {

            $scope.AllApplications = R.data;
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 7 });
            ResetOTPData();
            alert("application withdrawn successfully.");
            FarmMachineryObj.ShowPage();
        });
    }

    $scope.WithdrowApplication = function (A) {

        if (window.confirm("Are you sure to withdraw application?")) {
            CuurentData = A;
            ReasonToOTP = "Withdraw Application";
            CuurentActionID = 1;
            SendOTPTOUSerWithPurpose();

        }
    };

    let AllApplications = function () {



      

            FarmMachineryObj.BlockPage();
            $http({ method: "POST", url: URLS.Applications, params: { FinYear: $scope.Man.FinYear } }).then(function (R) {
                $scope.Header = "All New & In-Process Applications";
                R.data.filter(function (v) {

                    if (v.RCUploaded == true) {

                        FarmerService.GetTractorRC({ Application: v.Application }, function (data) {
                            v.TRCPic = data.FileBase64pic;

                        });
                    }

                });
                $scope.AllApplications = R.data;
                $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 20 && permit.ApplicationStatus != 7 });
                //$scope.CurrentYearApplication = $scope.AllApplications.filter(function (permit) { return permit.FinYear == new Date().getFullYear() && permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 9 && permit.ApplicationStatus != 7 ; });
                //$scope.PreviousYearApplication = $scope.AllApplications.filter(function (permit) { return permit.FinYear < new Date().getFullYear() && permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 9 && permit.ApplicationStatus != 7 ; });
                FarmMachineryObj.ShowPage();
            });

           
        





    };

    $scope.GetAllMakeModel = function (D) {
        FarmMachineryObj.BlockPage();
        $http({ method: "POST", url: URLS.GetAllMakeModels, params: { DealerID: D.DealerID, Implement: $scope.SelectedImplement.ImplementSubsidyID, ApplicationRefNo: $scope.SelectedImplement.Application, ManufacturerID: D.ManufacturerID } }).then(function (R) {
            $scope.DealerMakeModelList = R.data;
            $("#ViewMakeModel").modal();
            FarmMachineryObj.ShowPage();
        });
    }

    $scope.Close = function () {
        $scope.Implements.SchemeID = "0";
        $scope.Implements.FinYear = CurrentFinYear;
        $scope.Implements.ImplementSubsidyID = "0";
        $(".ErrorMessage").html("");
    }

    let AllDealers = function (I) {
        $scope.SelectedImplement = I;
        FarmMachineryObj.BlockPage();
        $http({ method: "POST", url: URLS.Dealers, params: { ImplementSubsidyID: I.ImplementSubsidyID, ApplicationNo: $scope.SelectedImplement.Application } }).then(function (R) {
            FarmMachineryObj.ShowPage();
            $scope.DealerList = R.data;
        });
    };

    var UploadRC = function (URL, callback) {


      
        if ($scope.IsTractorDriven) {
           // console.log("$scope.RegistrationCertificate", $('#RegistrationCertificate').get(0).files);
            fileUpload.uploadFileToUrl((($("#RegistrationCertificate"))[0].files[0]), URL, "TractorRC", function (R1) {
                callback(R1);

            });
        }
        else {
            callback(true);
        }
    }

    let Add = function () {
        let Component = 0;
        if ($scope.CompToApply.trim() == "5") {
            Component = 5;
        } else {

            Component = (($scope.TargetSchemes.length == 1) ? $scope.TargetSchemes[0].Value : $scope.Implements.SchemeID) == 1 ? 1 : 0;
        }
        ImplementDetails = {
            FinYear: $scope.Man.FinYear,
            ImplementSubsidyID: $scope.Implements.ImplementSubsidyID,
            SchemeID: ($scope.TargetSchemes.length == 1) ? $scope.TargetSchemes[0].Value : $scope.Implements.SchemeID,
            RegistrationNo: $scope.Implements.TRegistrationNo,
            SchemeComponentID: Component,
            LocationID: $scope.Implements.LocationID
        }
        try {
            //if (ImplementDetails.SchemeID != "0" && $scope.IsWindowOpen == false) {

            /*Saurav Checked */
            var URL = "../../Farmer/Management/UploadRegistrationCertificate"

            if (ImplementDetails.SchemeID != "0") {
                if ($scope.TargetSchemes.length > 0) {
                    if (ImplementDetails.FinYear != "0" && ImplementDetails.ImplementSubsidyID != "0" && ImplementDetails.LocationID != "0") {
                        $(".ErrorMessage").html(' <i class="fa fa-spinner fa-spin"></i> Saving Application Please Wait...');
                        FarmMachineryObj.BlockPage();
                        if (UploadRC(URL, function (valid) {
                            if (valid) {
                                $http({ method: 'POST', url: URLS.Add, params: { M: ImplementDetails } }).then(function (R) {

                                    if (angular.isArray(R.data)) {
                                        $scope.Header = "All New & In-Process Applications";
                                        $scope.AllApplications = R.data;
                                        $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 7 });

                                        $("#RegButton").hide();
                                        $("#TermsAndConditions").hide();

                                        var currentApplication = $scope.FarmerImplementList.find(function (Implement) { return Implement.ImplementSubsidyID == $scope.Implements.ImplementSubsidyID; });
                                        $(".ErrorMessage").html("Implement Saved Successfully. Please note down the pin to open application at dealer's end.<br/> Your Pin Is : <u style='color:green;'>" + currentApplication.GeneratedPin + "</i>");

                                        $scope.Implements.FinYear = $scope.Man.FinYear;
                                        $scope.Implements.ImplementSubsidyID = "0";
                                        FarmMachineryObj.ShowPage();
                                        //$scope.Close();
                                    }
                                    else {
                                        $(".ErrorMessage").html(R.data);
                                        alert(R.data);
                                        FarmMachineryObj.ShowPage();
                                    }


                                });
                            } else {
                                alert("Error in uploding document.");
                            }
                        }));
                    }
                    else {
                        alert("Please select Implement,scheme & Land Location.");
                    }
                }
                else { alert("Please select Implement,scheme & Land Location."); }
            }
            else {
                alert("Please select scheme & Land Location.");
            }
        }
        catch (e) {
            alert("Please select Implement,scheme & Land Location.");
        }
    }

    let AddLotteryApplication = function () {

        ImplementDetails = {
            FinYear: CurrentFinYear,
            ImplementSubsidyID: $scope.Implements.ImplementSubsidyID,
            SchemeID: 0,
            SchemeComponentID: 0,
            LocationID: $scope.Implements.LocationID
        }
        try {
            if ($scope.IsWindowOpen == true) {

                if (ImplementDetails.FinYear != "0" && ImplementDetails.ImplementSubsidyID != "0" && ImplementDetails.LocationID != "0") {
                    $(".ErrorMessage").html(' <i class="fa fa-spinner fa-spin"></i> Saving Application Please Wait...');
                    FarmMachineryObj.BlockPage();
                    $http({ method: 'POST', url: URLS.Add, params: { M: ImplementDetails } }).then(function (R) {

                        if (angular.isArray(R.data)) {
                            $scope.Header = "All New & In-Process Applications";
                            $scope.AllApplications = R.data;
                            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 7 });

                            $("#RegButton").hide();
                            $("#TermsAndConditions").hide();

                            var currentApplication = $scope.FarmerImplementList.find(function (Implement) { return Implement.ImplementSubsidyID == $scope.Implements.ImplementSubsidyID; });
                            $(".ErrorMessage").html("Implement Saved Successfully. Please note down the pin to open application at dealer's end.<br/> Your Pin Is : <u style='color:green;'>" + currentApplication.GeneratedPin + "</i>");

                            $scope.Implements.FinYear = CurrentFinYear;
                            $scope.Implements.ImplementSubsidyID = "0";
                            FarmMachineryObj.ShowPage();
                            //$scope.Close();
                        }
                        else {
                            $(".ErrorMessage").html(R.data);
                            alert(R.data);
                            FarmMachineryObj.ShowPage();
                        }


                    });
                }
                else {
                    alert("Please select Implement,scheme & Land Location.");
                }

            }
            else {
                alert("Currently Application window is closed for this Location.");
            }
        }
        catch (e) {
            alert("Please select Implement,scheme & Land Location.");
        }
    }

    let AddApplicationToRaythuRadham = function () {

        ImplementDetails = {
            FinYear: CurrentFinYear,
            ImplementSubsidyID: $scope.Implements.ImplementSubsidyID,
            SchemeID: ($scope.TargetSchemes.length == 1) ? $scope.TargetSchemes[0].Value : $scope.Implements.SchemeID,
            LocationID: $scope.Implements.LocationID
        }
        let validDoc = false;
        if (ImplementDetails.FinYear != "0" && ImplementDetails.ImplementSubsidyID != "0" && ImplementDetails.SchemeID != "0" && ImplementDetails.LocationID != "0") {
            if (angular.isUndefined($scope.RecommendationDocument)) {
                validDoc = false;
            } else {
                var file = $scope.RecommendationDocument;
                var RecommendationDocumentExtension = (!angular.isUndefined(file)) ? file.name.split('.').pop().toString().toLocaleLowerCase() : "";
                validDoc = angular.isUndefined($scope.RecommendationDocument) ? false : ((!angular.isUndefined(file)) ? (RecommendationDocumentExtension == "jpg" || RecommendationDocumentExtension == "png" || RecommendationDocumentExtension == "jpeg" || RecommendationDocumentExtension == "pdf") : false);
            }


            if (validDoc) {
                $(".ErrorMessage").html(' <img src="../../Images/Layout/fancybox_loading.gif" style="height: 20px; width: 20px;" />Saving Application...');

                var fd = new FormData();
                fd.append('RecommendationDocument', $scope.RecommendationDocument);
                fd.append('M', JSON.stringify(ImplementDetails));
                $http.post(URLS.AddApplicationWithStateScheme, fd, { transformRequest: angular.identity, headers: { 'Content-Type': undefined } }).then(function (R) {
                    FarmMachineryObj.ShowPage();
                    if (angular.isArray(R.data)) {
                        $scope.Header = "All New & In-Process Applications";
                        $scope.AllApplications = R.data;
                        $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 9 && permit.ApplicationStatus != 7 });

                        $("#RegButton").hide();
                        $("#TermsAndConditions").hide();
                        var currentApplication = $scope.FarmerImplementList.find(function (Implement) { return Implement.ImplementSubsidyID == $scope.Implements.ImplementSubsidyID; });
                        $(".ErrorMessage").html("Implement Saved Successfully. Please note down the pin to open application at dealer's end.<br/> Your Pin Is : <u style='color:green;'>" + currentApplication.GeneratedPin + "</i>");

                        $scope.Implements.FinYear = CurrentFinYear;
                        $scope.Implements.ImplementSubsidyID = "0";
                    }
                    else {
                        $(".ErrorMessage").html(R.data);
                    }
                });
            }
            else {
                alert("Document not attached - Please upload Document for selected scheme.");
            }
        }
        else {
            alert("Please select Implement and scheme.");
        }
    }

    $scope.ShowPin = function (App) {
        var currentApplication = $scope.FarmerImplementList.find(function (Implement) { return Implement.Application == App.Application; });
        FarmMachineryObj.ShowMessage("Application Pin", "Please note down the pin to open application at dealer's end.<br/> Your pin to open application is : <u style='color:green;'>" + currentApplication.GeneratedPin + "</i>")
    }

    $scope.IsTractorDriven = false;

    let checkTractorDriven = function () {

        $http({ method: 'GET', url: '../../Dealer/FarmerApplication/PowerSource', params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID } }).then(function (Res) {
            var P = Res.data;
            $scope.IsTractorDriven = (P == 3 || P == 8 || P == 9 || P == 10) ? true : false;

        });
    }

    $scope.OnImplementChange = function () {
        $scope.TermClick = false;
        $scope.Implements.SchemeID = "0";
        
        $("#TermsAndConditions").hide();
        $scope.HasFile = false;
        $scope.Message = "";
        if (parseInt($scope.Implements.ImplementSubsidyID) > 0)
            checkTractorDriven();
        if (!IsBlank($scope.Implements.LocationID)) {
            $(".ErrorMessage").html(waitHtml);
            $http({ method: 'POST', url: URLS.Target, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, Year: $scope.Man.FinYear, Scheme: 0, component: 0, LandID: $scope.Implements.LocationID } }).then(function (R) {

                if (parseInt(R.data) > -10) {

                    $http({ method: 'POST', url: URLS.Schemes, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, Year: $scope.Man.FinYear, LandID: $scope.Implements.LocationID } })
                        .then(function (R1) {
                            $scope.TargetSchemes = R1.data;
                            if ($scope.TargetSchemes.length == 1) {

                                var sc = $scope.TargetSchemes[0].Value;
                                let comp = "";
                                $scope.CompToApply = "";
                                if (isNorthEast) {

                                    $http({ method: 'POST', url: URLS.Components, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, Year: $scope.Man.FinYear, LandID: $scope.Implements.LocationID, SchemeID: sc } })
                                        .then(function (R2) {

                                            comp = R2.data[0].Value;
                                            $scope.CompToApply = comp;
                                            $http({
                                                method: 'POST', url: URLS.Target, params: {
                                                    ImplementSubsidyID: $scope.Implements.ImplementSubsidyID,
                                                    Year: $scope.Man.FinYear, Scheme: sc, component: comp, LandID: $scope.Implements.LocationID
                                                }
                                            }).then(function (R) {

                                                $scope.RemainingTG = parseInt(R.data);
                                                if ($scope.RemainingTG > 0) {


                                                    $http({ method: "POST", url: URLS.DealersCheck, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, LandID: $scope.Implements.LocationID, Year: $scope.Man.FinYear } }).then(function (R) {
                                                        FarmMachineryObj.ShowPage();

                                                        var Dlrs = R.data;
                                                        var msg = (Dlrs <= 0 ? ", But no dealer available for this Implement, You can add the application but it will wait for the dealer." : ", No of Approved Dealers Available : " + Dlrs);
                                                        $(".ErrorMessage").html("Available Target : " + $scope.RemainingTG + "\n" + msg);
                                                        

                                                    });



                                                }
                                                else if ($scope.RemainingTG == 0) {
                                                    $(".ErrorMessage").html("Presently no target is available for this implement, Your application will go to the wailting list.");
                                                    
                                                }
                                            });
                                        });
                                } else {

                                    comp = $scope.TargetSchemes[0].Value == 1 ? "1" : "0";
                                    $scope.CompToApply = comp;
                                    $http({
                                        method: 'POST', url: URLS.Target, params: {
                                            ImplementSubsidyID: $scope.Implements.ImplementSubsidyID,
                                            Year: $scope.Man.FinYear, Scheme: sc, component: comp, LandID: $scope.Implements.LocationID
                                        }
                                    }).then(function (R) {

                                        $scope.RemainingTG = parseInt(R.data);
                                        if ($scope.RemainingTG > 0) {


                                            $http({ method: "POST", url: URLS.DealersCheck, params: { ImplementSubsidyID: $scope.Implements.ImplementSubsidyID, LandID: $scope.Implements.LocationID, Year: $scope.Man.FinYear } }).then(function (R) {
                                                FarmMachineryObj.ShowPage();

                                                var Dlrs = R.data;
                                                var msg = (Dlrs <= 0 ? ", But no dealer available for this Implement, You can add the application but it will wait for the dealer." : ", No of Approved Dealers Available : " + Dlrs);
                                                $(".ErrorMessage").html("Available Target : " + $scope.RemainingTG + "\n" + msg);
                                                

                                            });

                                        }
                                        else  {
                                            $(".ErrorMessage").html("Presently no target is available for this implement, Your application will go to the wailting list.");
                                            
                                        }
                                    });
                                }

                            }
                            else {
                                $(".ErrorMessage").html("Presently no target is available for this implement in your location, You may contact to your district or block officers.");
                                $('#RegButton').hide();
                            }
                            if ($scope.TargetSchemes.length == 1) {
                                $http({ method: "POST", url: URLS.ISSchemeHasFile, params: { SchemeID: $scope.TargetSchemes[0].Value } }).then(function (R) {
                                    $scope.HasFile = R.data;

                                });
                            }
                            if ($scope.TargetSchemes.length > 0) { if ($scope.TargetSchemes[0].Value == 29) { $('#GSTInfo').modal("show"); } }

                        });
                    $scope.ShowTarget = true;
                    $scope.Target = R.data;

                }
                else {

                    $(".ErrorMessage").html("Subsidy Target for This Implement is Not Available.");
                    $scope.TargetSchemes = {};
                }
            });
        }

    }

    $scope.refress = function () {
        $scope.ShowDealer = false;
        $scope.DealerSelected = false;
        $scope.Implements = {};
        $scope.Implements.FinYear = CurrentFinYear;
        $scope.Implements.ImplementSubsidyID = "0";
    };

    let GetLocations = function () {
        $http({ method: "POST", url: URLS.LandLocations }).then(function (R) {
            $scope.Location = R.data;
        });
    };

    let PreFYChange = function () {

        $scope.DealerList = {};

        $http({ method: 'GET', url: '../../TargetManagement/GetSession', params: { filter: 0 } }).then(function (Response) {
            $scope.SessionObject = Response.data;
            $http({ method: 'GET', url: '../../api/dropdown/GetIsNorthEast', params: { stateCode: $scope.SessionObject.StateCode } }).then(function (Response) {
                if (Response.data == true) {
                    isNorthEast = true;
                } else {
                    isNorthEast = false;
                }

            });
        });

       
        FarmerService.FarmerSession(function (Session) {
            if (angular.isObject(Session)) {
                $scope.FarmerDetails = Session;
            }
            else {
                $location.path.href = "../../index/login"
            }
        });
        $scope.ShowDealer = false;
        $scope.ShowTarget = false;
        $scope.ShowTable = true;
        $scope.DealerSelected = false;
        $scope.Implements = {};
        $scope.Implements.FinYear = CurrentFinYear;
        $scope.Implements.LocationID = "0";
        $scope.Implements.ImplementSubsidyID = "0";
        $scope.TermClick = false;
        $("#RegButton").hide();
        $("#TermsAndConditions").hide();
        GetLocations();
        $scope.FillFinYear = CurrentFinYear;
    }

    $scope.OnFYChange = function () {
        //PreFYChange();
        if ($scope.Man.FinYear.trim() == (CurrentFinYear+"").trim() || $scope.Man.FinYear == ((CurrentFinYear - 1)+"").trim()) {
            AllApplications();
            GetLocations();
            $scope.Implements.LocationID = "0";
            $(".ErrorMessage").html("");
        } else {
            $(".ErrorMessage").html("Application for selected Financial Year has been closed.");
            $scope.Location = {};
            $scope.Implements.LocationID = "0";
            AllApplications();
        }

    }

    $scope.Man = {};

    $scope.Load = function () {
        $http({ method: 'GET', url: '../../api/dropdown/GetCurrentFinacialYear', params: { filter: 0 } }).then(function (R) {
            if (R.data > 0) {
                CurrentFinYear = R.data;

                $http({ method: 'GET', url: '../../api/dropdown/GetFinacialYear', params: { filter: 0 } }).then(function (Response) {
                    $scope.FillYear = Response.data;
                });
                PreFYChange();
                $scope.Man.FinYear = CurrentFinYear + "";
                $scope.OnFYChange();
            }
        });

    };

    $scope.Load();

    $scope.OnLocationChange = function () {


        $http({ method: 'GET', url: '../../api/dropdown/GetApplicationWindowStatusForFarmerApplication', params: { locationID: $scope.Implements.LocationID, Year: $scope.Man.FinYear } }).then(function (Response) {
            let windowStatus = Response.data;
            


            if (windowStatus.ApplicationOpenForSingleImplement == true) {

                $http({ method: 'GET', url: '../../api/dropdown/GetBeneficiarySelectionMethod', params: { filter: 0 } }).then(function (Response) {
                    $scope.BSMethod = Response.data;

                    if ($scope.BSMethod[0].Value.trim() == "1") {
                        $scope.IsWindowOpen = true;
                        getImplements();

                    }
                    if ($scope.BSMethod[0].Value.trim() == "2") {
                        $scope.IsWindowOpen = true;
                        getAllImplements();
                    }
                    if ($scope.BSMethod[0].Value.trim() == "3") {
                        $http({ method: 'GET', url: '../Management/IsWindowOpen', params: { LocationID: $scope.Implements.LocationID } }).then(function (Response) {
                            $scope.IsWindowOpen = Response.data.toLowerCase() == 'true' ? true : false;

                            if ($scope.IsWindowOpen) {

                                $http({ method: 'get', url: '../Management/FindImplementForLotteryApplication', params: { LocationID: $scope.Implements.LocationID } }).then(function (R) {

                                    $scope.StateImplements = R.data;
                                });
                            }

                        });
                    }



                });

            } else {
                $scope.IsWindowOpen = false;

                

                    $(".ErrorMessage").html("Application window for this state and financial year is not open so you will not be able to apply.");
                
            }
        });

    }

    let AddImplementToApplication = function () {


        if ($scope.HasFile) {
            AddApplicationToRaythuRadham();
        } else if ($scope.BSMethod[0].Value.trim() != "3") {
            Add();
        } else if ($scope.BSMethod[0].Value.trim() == "3" && $scope.IsWindowOpen == true) {
            AddLotteryApplication();
        } else {
            alert("There is an error to add application.");
        }

    }

    $scope.AddImplement = function () {

        let x = window.confirm("You will not be able to change the farmer's details (Farmer Type, Farmer Category and Gender) once applied for the Implement. please make sure that all the farmers details is correct.");
        if (x) {
            
            ReasonToOTP = "ApplyApplication";
            CuurentActionID = 3;
            SendOTPTOUSerWithPurpose();
        }
    }

    $scope.RegisterApplication = function () {


        FarmMachineryObj.BlockPage();
        $(".ErrorMessage").html("");
        $scope.TargetSchemes = {};
        FarmerService.FarmerLandDetails(function (Land) {
            $scope.FarmerLandDetails = Land;

            if ($scope.FarmerLandDetails.length > 0) {
                $http({ method: "POST", url: URLS.HasValidDocuments }).then(function (R) {
                    if (R.data == true) {
                        $scope.ApplicationRefNo = R.data;
                        FarmMachineryObj.ShowPage();
                        //$("#AddImplements").show();
                        $scope.TermClick = false;
                        $("#RegButton").hide();
                    }
                });
            }
            else {
                FarmMachineryObj.ShowPage();
                alert("No Land Detail Available ,Please Enter land details before appliation registration.");
            }
        });


    }

    $scope.Dealers = function (Implement) {

        $scope.SelectedImplement = Implement;
        $scope.ShowDealer = true;
        $scope.DealerSelected = false;
        $scope.ShowTable = true;

        AllDealers(Implement);
        FarmMachineryObj.ScrollBottom(100, 10);
    }

    $scope.OnDealerSelection = function (d) {
        $scope.DealerSelected = true;
        $scope.dlr = d;
        $("#SelectedDealer").modal();
    };

    $scope.SubmitDealer = function () {

        if (window.confirm("You will not be able to change dealer once you select the dealer. Are You Sure You Want To Purchase Implement from Selected Dealer?")) {
            ReasonToOTP = "Select Dealer";
            CuurentActionID = 2;
            SendOTPTOUSerWithPurpose();
            
        }

    }

    let SaveSelectedDealer = function () {
        FarmMachineryObj.BlockPage();
        $("#DealerSubmitButton").html(waitHtml);
        $http({ method: "POST", url: URLS.AddDealer, params: { M: { Dealer: $scope.dlr, ImplementID: $scope.SelectedImplement.ImplementSubsidyID, Application: $scope.SelectedImplement.Application, ManufacturerID: $scope.SelectedImplement.ManufacturerID } } }).then(function (R) {
            FarmMachineryObj.ShowPage();
            $("#DealerSubmitButton").html(' <i class="fa fa-save"></i> Submit');
            $("#SelectedDealer").modal('toggle');
            $scope.ShowTable = false;
            $scope.refress();
            $scope.Header = "All New & In-Process Applications";
            $scope.Implements.FinYear = CurrentFinYear;
            $scope.AllApplications = {};
            AllApplications();
            $scope.FarmerImplementList = $scope.AllApplications.filter(function (permit) { return permit.ApplicationStatus != 12 && permit.ApplicationStatus != 14 && permit.ApplicationStatus != 9 && permit.ApplicationStatus != 7 });
        });
    }

    $scope.ShowSelectedDealer = function (permit) {

        $scope.SelectedImplement = permit;
        FarmMachineryObj.BlockPage();
        $http({ method: "POST", url: URLS.ShowDealer, params: { DealerID: permit.DealerID, ImplementSubsidyID: permit.ImplementSubsidyID, ApplicationNo: permit.Application } }).then(function (R) {
            $scope.dlr = R.data;
            $scope.ShowDealer = true;
            $scope.DealerSelected = true;
            $scope.ShowTable = false;
            FarmMachineryObj.ShowPage();
            $("#SelectedDealer").modal();
        });
    }

    $scope.TandCClick = function () {

        $("#TermsAndConditions").show();
        $("#TermsAndConditions").modal();
        $http({ method: 'GET', url: '../Application/GetTandC', params: { StateCode: $scope.SessionObject.StateCode } }).then(function (Response) {
            $scope.TC = Response.data;

        });
    }

    $scope.TermClick = false;

    $scope.ChkClick = function () {


        if (!$scope.TermClick) { $scope.TermClick = true; }
        else {
            $scope.TermClick = false;
        }

        if ($scope.TermClick) {

            $("#RegButton").show();
        }
        else {
            $("#RegButton").hide();
        }
    }

    $rootScope.Application = {};

    $scope.Print = function (permit) {

        $rootScope.ApplicationDetails = permit;
        window.location = "../../Report/Report/NewApplication?p=" + JSON.stringify(permit);
    }

    $scope.OTPSent = false;
    $scope.OTPVerified = false;
    $scope.OTPData = {};
    $scope.OTP = {};
    let CuurentActionID = 0;
    let CuurentData = null;
    $('#OTPModal').modal('hide');

    let Action = {

        1: withdrawAoolicationAfterVerification,
        2: SaveSelectedDealer,
        3: AddImplementToApplication
    }

    let ResetOTPData = function () {

        $scope.OTPSent = false;
        $scope.OTPVerified = false;
        $scope.OTPData = {};
        $scope.OTP = {};
        CuurentActionID = 0;
        CuurentData = null;
        $('#OTPModal').modal('hide');
    }

    let SendOTPTOUSer = function () {
        $('#OTPModal').modal('show');
        OTPService.SendOTP(function (sendres) {

            $scope.OTPData = sendres;
            $scope.OTPSent = true;


            if (sendres != null) {

            } else {
                alert("There is some error in sending OTP.");
                ResetOTPData();
            }
        });
    }

    let ReasonToOTP = "";

    let SendOTPTOUSerWithPurpose = function () {
        // $('#OTPModal').modal('show');
        // OTPService.SendOTPWithPurpose(function (sendres) {

        //     $scope.OTPData = sendres;
        //     $scope.OTPSent = true;


        //     if (sendres != null) {

        //     } else {
        //         alert("There is some error in sending OTP.");
        //         ResetOTPData();
        //     }
        // }, { Purpose: ReasonToOTP });

        if (CuurentData != null)
                    Action[CuurentActionID](CuurentData);
                else
                    Action[CuurentActionID]();
                $scope.OTPVerified == true;
    }

    $scope.VerifyOTP = function () {

        // $scope.OTP.OtpValue = "";
                if (CuurentData != null)
                    Action[CuurentActionID](CuurentData);
                else
                    Action[CuurentActionID]();
                $scope.OTPVerified == true;
    }


    ///////////////////////////////////////// Upload RC of Tractor  --------------------
    let CApplicationNo = "";
    $scope.UploadTractorRC = function () {
        
        let URL = "../../Farmer/Management/UploadTractorRegistrationCertificate"
        fileUpload.uploadFileToUrl((($("#TractorRegistrationCertificate"))[0].files[0]), URL, CApplicationNo, function (R1) {

            if (R1.trim() == "T") {
                alert("uploaded..");
                $('#UploadTrRC').modal('hide');
                GetPhoto(CApplicationNo);
                AllApplications();
            }
            else {
                alert("unable to upload.");
            }
        });
    }


    $scope.UploadTRC = function (d) {
       
        CApplicationNo = d.Application;
        $('#UploadTrRC').modal();
        
    }


    // var Links = function (type) {
    //     return "../Management/getTractorRCDocument?name=" + type;
    //}

    var GetPhoto = function (app) {
       
        FarmerService.GetTractorRC({ Application: app }, function (data) {
            $scope.TRCPic = data.FileBase64pic;
           
        });
      
    }


    //-------------------------------------------------------------------


}