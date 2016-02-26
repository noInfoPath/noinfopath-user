var noLoginServiceMocks = {

 	login: {
		noInfoPathUser: "{\"token_type\":\"bearer\",\"access_token\":\"ZeRoXFgt2zNjdo4swgdiR3eTt3eVysJ0uBk7M1tSZnBPiF_4GOSV2QVeVsLmPecriUK29iMwIFx8f00NrwlTHxNVoi54cXOurNT40Cd7SNrp6qhyacIQEDLufajEev6_hoTyfxZdpbXwmAx62YZ7mZnHSHYWMkWFKhK_ha8t4skaCbaRkraU8nhFHWq0pH8_pIxFmPbcne_1vUh-t0FdxQT4F9rlyKZ_O2EKyXCiBLAUqHOFuuIXsfzjQk5Px9uXS4S-4bLr-YrjGM5HzmN9uJMbkQDIQJFF6UP8gSbHrmwTqZUC0q0gIi3UCkvDCdd5W1cYLiT9HGK8a_WTQnkJFZQOd_RKqyTSom5Soxqrv1T5utZEfFl9B3jCS-nJlbmmv_mHE5b0PLESI5G2SrzXwLX03MyhcocoQelCF5SxQHsOmRZi2Bv1qkTuv2l6h9ia6FRnz5TFOoQMe1TcwFIma1oaLPqVaGxXDwX6skMMuGc\",\"username\":\"gochinj\",\"expires\":\"2015-05-07T18:07:43.000Z\",\"acl\":\"[]\"}",
		request: {
			url: "http://noinfopath-rest.img.local/token",
			headers: {},
			body: {
				username: "gochinj",
				password: "fubar"
			}
		},
		response: {
			status: 200,
			header: {},
			body: {
			    "access_token": "ZeRoXFgt2zNjdo4swgdiR3eTt3eVysJ0uBk7M1tSZnBPiF_4GOSV2QVeVsLmPecriUK29iMwIFx8f00NrwlTHxNVoi54cXOurNT40Cd7SNrp6qhyacIQEDLufajEev6_hoTyfxZdpbXwmAx62YZ7mZnHSHYWMkWFKhK_ha8t4skaCbaRkraU8nhFHWq0pH8_pIxFmPbcne_1vUh-t0FdxQT4F9rlyKZ_O2EKyXCiBLAUqHOFuuIXsfzjQk5Px9uXS4S-4bLr-YrjGM5HzmN9uJMbkQDIQJFF6UP8gSbHrmwTqZUC0q0gIi3UCkvDCdd5W1cYLiT9HGK8a_WTQnkJFZQOd_RKqyTSom5Soxqrv1T5utZEfFl9B3jCS-nJlbmmv_mHE5b0PLESI5G2SrzXwLX03MyhcocoQelCF5SxQHsOmRZi2Bv1qkTuv2l6h9ia6FRnz5TFOoQMe1TcwFIma1oaLPqVaGxXDwX6skMMuGc",
			    "token_type": "bearer",
			    "expires_in": 1209599,
			    "userName": "gochinj",
			    ".issued": "Thu, 23 Apr 2015 18:07:43 GMT",
			    ".expires": "Thu, 07 May 2015 18:07:43 GMT",
				"acl": "[]"
			}
		}
	},

	updatepass: {
		noInfoPathUser: "{\"token_type\":\"bearer\",\"access_token\":\"ZeRoXFgt2zNjdo4swgdiR3eTt3eVysJ0uBk7M1tSZnBPiF_4GOSV2QVeVsLmPecriUK29iMwIFx8f00NrwlTHxNVoi54cXOurNT40Cd7SNrp6qhyacIQEDLufajEev6_hoTyfxZdpbXwmAx62YZ7mZnHSHYWMkWFKhK_ha8t4skaCbaRkraU8nhFHWq0pH8_pIxFmPbcne_1vUh-t0FdxQT4F9rlyKZ_O2EKyXCiBLAUqHOFuuIXsfzjQk5Px9uXS4S-4bLr-YrjGM5HzmN9uJMbkQDIQJFF6UP8gSbHrmwTqZUC0q0gIi3UCkvDCdd5W1cYLiT9HGK8a_WTQnkJFZQOd_RKqyTSom5Soxqrv1T5utZEfFl9B3jCS-nJlbmmv_mHE5b0PLESI5G2SrzXwLX03MyhcocoQelCF5SxQHsOmRZi2Bv1qkTuv2l6h9ia6FRnz5TFOoQMe1TcwFIma1oaLPqVaGxXDwX6skMMuGc\",\"username\":\"gochinj\",\"expires\":\"2015-05-07T18:07:43.000Z\",\"acl\":\"[]\"",
		request: {
			url: "http://noinfopath-rest.img.local/api/account/changepassword",
			body: {
			  "OldPassword": "fubar",
			  "NewPassword": "fubar2",
			  "ConfirmPassword": "fubar2"
			}
		},
		response: {
			status: 200,
			header: {}
		}
	},

	register: {
		request: {
			url: "http://noinfopath-rest.img.local/api/account/register",
			body: {
				"Email": "ryan@ryan.net",
				"Password": "#1@Test",
				"ConfirmPassword": "#1@Test"
			}
		},
		response: {
			status: 200,
			header: {}
		}
	}
};
